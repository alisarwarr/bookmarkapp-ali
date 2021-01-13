import React, { useState } from 'react';
import style from './index.module.scss';
import classnames from 'classnames';
//COMPONENTS
import Head from '../components/Head';
import Message from '../components/Message';
import ReadModal from '../components/ReadModal';
//SWEETALERT2
import { darkAlert } from '../alerts';
//MATERIAL-UI
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
//REACT-REVEAL
import Zoom from 'react-reveal/Zoom';
//GATSBYJS
import { graphql, useStaticQuery } from 'gatsby';
//APOLLO-GRAPHQL
import { gql, useQuery, useMutation } from '@apollo/client';
//FORMIK & YUP
import { Formik, ErrorMessage, Field } from 'formik';
import { object, string } from 'yup';

const ALL_BOOKMARK = gql`
    query {
        allBookmarks {
            id
            title
            url
            description
        }
    }
`

const ADD_BOOKMARK = gql`
    mutation($title: String!, $url: String!, $description: String!){
        addBookmark(title: $title, url: $url, description: $description) {
            title
            url
            description
        }
    }
`

const DEL_BOOKMARK = gql`
    mutation($id: ID!){
        delBookmark(id: $id) {
            title
            url
            description
        }
    }
`

const truncate = (str: string, n: number) => str?.length > n ? `${str.substr(0, n-1)} ...` : str;
const process = (timeout: any) => new Promise(() => timeout);

export default function() {
    const [ dark, setdark ] = useState<boolean>(true);

    const { loading, error, data } = useQuery(ALL_BOOKMARK);
    const [ adding ] = useMutation(ADD_BOOKMARK);
    const [ deleting ] = useMutation(DEL_BOOKMARK);

    const handleAdd = (obj) => {
        adding({
            variables: {
                title: obj.title,                                       //assigned 'title'
                url: obj.url,                                           //assigned 'url'
                description: obj.description                            //assigned 'description'
            },
            refetchQueries: [{ query: ALL_BOOKMARK }]
        })
    }

    const handleDel = (thatId) => {
        deleting({
            variables: {
                id: thatId                                              //assigned 'id'
            },
            refetchQueries: [{ query: ALL_BOOKMARK }]
        })
    }

    const datas = useStaticQuery(graphql`
        query {
            site {
                siteMetadata {
                    title
                }
            }
        }
    `)

    if(loading) return (
        <>
            <Head
            />

            <div className={style.box}>
                <Message
                    sentence="Loading"
                />
            </div>
        </>
    )

    if(error) return (
        <>
            <Head
            />

            <div className={style.box}>
                <Message
                    sentence="Sorry, Error 404!"
                />
            </div>
        </>
    )

    return (
        <div
            className={classnames(style.body, data.allBookmarks.length > 1 && style.bodyconditionalforontop)}
            style={{ backgroundColor: dark ? 'rgba(214, 69, 65, 1)' : 'rgba(83, 51, 237, 1)' }}
        >
            <Head
            />

            <Zoom>
                <div className={style.root}>
                    <Card className={style.collect} square raised>
                        <CardContent className={style.collect_content} style={{ backgroundColor: dark ? 'black' : 'white' }}>
                            <Typography variant="h2" className={classnames(style.title, `${dark ? 'outlineBlack' : 'outlineWhite'}`)} style={{ backgroundColor: dark ? 'rgba(214, 69, 65, 1)' : 'rgba(83, 51, 237, 1)', color: 'white' }}>
                                <p> {`${datas.site.siteMetadata.title}`} </p>
                            </Typography>
    
                            <Formik
                                initialValues={{ title: '', url: '', description: '' }}
                                validationSchema={
                                    object({
                                        title : string()
                                        .max(30, 'Must be atmost 30 character')
                                        .min(3, 'Must have atleast 3 characters')
                                        .required('Must fill title'),
        
                                        url: string()
                                        .matches(
                                            /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                                            'Enter correct url!'
                                        )
                                        .required('Must fill url'),

                                        description : string()
                                        .max(50, 'Must be atmost 50 character')
                                        .min(10, 'Must have atleast 10 characters')
                                        .required('Must fill description'),
                                    })
                                }
                                onSubmit={async (values, { setSubmitting, resetForm }) => {
                                    setSubmitting(true);
    
                                    const willOccur = setTimeout(() => {
                                        resetForm();
                                        setSubmitting(false);
                                      //calling functions after 1.5 secs
                                        handleAdd(values);
                                    }, 1500);
                                    
                                    await process(willOccur);
                                }}
                            >
                                {({ values, handleChange, handleSubmit, isSubmitting }) => (
                                    <form
                                        onSubmit={handleSubmit}            //formik's
                                        autoComplete="off"
                                    >
                                        <div className={classnames("form-group", style.first)}>
                                            <label style={{ color: dark ? 'white' : 'black' }}> TITLE </label>
                                            <input
                                                name='title'
                                                value={values.title}       //formik's
                                                onChange={handleChange}    //formik's
                                                type="text"
                                                placeholder="Enter a title . . ."
                                                className="form-control"
                                            />
                                            <ErrorMessage name='title' component="p" className={style.err} style={{ color: dark ? 'rgb(255, 255, 255)' : 'black' }}/>
                                        </div>
                        
                                        <div className={classnames("form-group", style.second)}>
                                            <label style={{ color: dark ? 'white' : 'black' }}> URL </label>
                                            <input
                                                name='url'
                                                value={values.url}         //formik's
                                                onChange={handleChange}    //formik's
                                                type="text"
                                                placeholder="Enter a url . . ."
                                                className="form-control"
                                            />
                                            <ErrorMessage name='url' component="p" className={style.err} style={{ color: dark ? 'rgb(255, 255, 255)' : 'black' }}/>
                                        </div>

                                        <div className={classnames("form-group", style.third)}>
                                            <label style={{ color: dark ? 'white' : 'black' }}> DESCRIPTION </label>
                                            <textarea
                                                name='description'
                                                value={values.description} //formik's
                                                onChange={handleChange}    //formik's
                                                className="form-control"
                                                placeholder="Enter a description . . ."
                                                rows="3"
                                            />
                                            <ErrorMessage name='description' component="p" className={style.err} style={{ color: dark ? 'rgb(255, 255, 255)' : 'black' }}/>
                                        </div>

                                        <div className={style.btn}>
                                            <p>
                                                <button className={style.button} type='submit' className={`btn btn-${dark ? `danger` : `primary`} shadow-none`} disabled={isSubmitting}>
                                                    SUBMIT { isSubmitting && <CircularProgress style={{ color: 'white', marginTop: "0.5rem", marginLeft: "0.4rem" }} size={18}/>}
                                                </button>
                                            </p>

                                            <IconButton onClick={() => { setdark(x => !x); darkAlert(dark); }} className={style.iconbutton} size='small'>
                                                {dark ? <Brightness7Icon style={{ color: 'white' }} size='small'/> : <Brightness4Icon size='small' style={{ color: 'black' }}/>}
                                            </IconButton>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </CardContent>
    
                        <>
                            {
                                data.allBookmarks.length > 0 && (
                                    <div className={style.collection}>
                                        {
                                            data.allBookmarks.map((obj, i) => (
                                                <Zoom key={obj.id}>
                                                    <Card className={style.card} raised>
                                                        <CardContent className={style.card_content}>
                                                            <div className={style.card_content_top}>
                                                                <Typography variant="h5" component="h2">
                                                                    {obj.title}
                                                                </Typography>
                                                                <IconButton onClick={() => handleDel(obj.id)}>
                                                                    <DeleteIcon style={{ color: 'black' }}/>
                                                                </IconButton>
                                                            </div>

                                                            <div className={style.card_content_bottom}>
                                                                <small className="form-text text-muted">
                                                                    {obj.description}
                                                                </small>
                                                                <a href={obj.url} target='_blank'> {obj.url} </a>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Zoom>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </>
                    </Card>
                </div>
            </Zoom>
        </div>
    )
}
