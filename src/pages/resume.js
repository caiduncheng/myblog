import React from 'react'
import {graphql} from 'gatsby'
import Layout from '../components/Layout'
import Header from '../components/Header'


export default function Resume ({ data }) {
    const node = data.allMarkdownRemark.nodes[0]
    return (
        <Layout>
            <Header title="简历"/>
            <div className="container">
                <div
                    className="article-post"
                    dangerouslySetInnerHTML={{ __html: node.html }}
                />
            </div>
        </Layout>
    )
}

export const pageQuery = graphql`
    query resume {
        allMarkdownRemark(filter: {frontmatter: {template: {eq: "resume"}}}) {
            nodes {
                html
            }        
        }
    }
`