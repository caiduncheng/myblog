import React, { useMemo } from 'react'
import { graphql } from 'gatsby'
import Helmet from 'react-helmet'

import Layout from '../components/Layout'
import Posts from '../components/Posts'
// import SEO from '../components/SEO'

import { getSimplifiedPosts } from '../util'
import config from '../util/config'

export default function TagTemplate({ data, pageContext }) {
  const { tag } = pageContext
  const { totalCount } = data.allMarkdownRemark
  const posts = data.allMarkdownRemark.edges
  const simplifiedPosts = useMemo(() => getSimplifiedPosts(posts), [posts])  

  return (
    <Layout>
      <Helmet title={`Posts tagged: ${tag} | ${config.siteTitle}`} />
      {/* <SEO /> */}
      <header>
        <div className="container">
          <h1>标签包含<span className="tag-name">{tag}</span>的文章</h1>
          <p className="subtitle">
            共找到
            <span className="count">{totalCount}</span>
            篇
          </p>
        </div>
      </header>
      <section className="container">
        <Posts data={simplifiedPosts}/>
      </section>
    </Layout>
  )
}

export const pageQuery = graphql`
  query TagPage($tag: String) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            date(formatString: "YYYY-MM-DD ")
            title
            tags            
          }
        }
      }
    }
  }
`
