const dotenv = require('dotenv');
dotenv.config();


const { ApolloServer, gql } = require('apollo-server-lambda');
var faunadb = require('faunadb'),
q = faunadb.query;


const typeDefs = gql`
    type bookmarkType {
        id: ID!
        title: String!
        url: String!
        description: String!
    }

    type Query {
        allBookmarks: [bookmarkType]
    }

    type Mutation {
        addBookmark(title: String!, url: String!, description: String!): bookmarkType
        delBookmark(id: ID!): bookmarkType
    }
`

var adminClient = new faunadb.Client({
    secret: process.env.FAUNADB_ADMIN_SECRET
})

const resolvers = {
    Query: {
        allBookmarks: async() => {
            try {
                const result = await adminClient.query(
                    q.Map(
                        q.Paginate(q.Documents(q.Collection('bookmarks'))),
                        q.Lambda(x => q.Get(x))
                    )
                )

                const modifiedData = result.data.map(obj => {               //array holding only 'id', 'title' & 'url' property value
                    return { id: obj.ref.id, title: obj.data.title, url: obj.data.url, description: obj.data.description }
                })

                return modifiedData;                                        //return that array
            }
            catch(error) {
                console.log(error);   
            }
        }
    },

    Mutation: {
        addBookmark: async(_, {title, url, description}) => {
            try {
                const result = await adminClient.query(
                    q.Create(
                        q.Collection('bookmarks'),
                        { data: { title, url, description } }               //'title' , 'url' & 'description' assigned
                    )
                )
            }
            catch(error) {
                console.log(error);
            }
        },

        delBookmark: async(_, {id}) => {
            try {
                const result = await adminClient.query(
                    q.Delete(
                        q.Ref(q.Collection('bookmarks'), id)                //'id' assigned
                    )
                )
            }
            catch(error) {
                console.log(error);   
            }
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
    introspection: true
})

exports.handler = server.createHandler();