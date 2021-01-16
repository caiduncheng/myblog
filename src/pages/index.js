import React, { useMemo } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Header from '../components/Header'
import github from '../../content/images/github.png'
import { getSimplifiedPosts } from '../util'
import Posts from '../components/Posts'

const Index = ({ data }) => {
  const latest = data.latest.edges  
  const simplifiedLatest = useMemo(() => getSimplifiedPosts(latest), [latest])
  console.log(simplifiedLatest)
  
  const Section = ({ title, children, button, ...props }) => (
    <section {...props}>
      <h2>
        {title}
        {button && (
          <Link className="section-button" to="/blog">
            所有
          </Link>
        )}
      </h2>
      {children}
    </section>
  )

  return (
    <Layout>
      <Header title="我是Caidc.">
        <p>一名咸鱼前端，切图仔</p>
        <p className="flex">
          <a className="button">
            My Github profile
            <img src={github} style={
              {
                display: 'inline-block', 
                margin: '0px 0px 0px 0.5rem',
                maxWidth: '2.5rem',
                maxHeight: '2.5rem'
              }
            }/>
          </a>
        </p>
      </Header>
      <div className="container index">
        <Section title="最新发布" button>
          <Posts data={simplifiedLatest}/>
        </Section>
      </div>
      </Layout>
      // <div>
      //   <h1>文章列表</h1>
      //   <h4>共{data.allMarkdownRemark.totalCount} 篇文章</h4>
      //   {data.allMarkdownRemark.edges.map(({ node }) => (
      //     <div key={node.id}>
      //       <Link to={node.fields.slug}>
      //       <h3>
      //         {node.frontmatter.title}{" "}
      //         <span>
      //           — {node.frontmatter.date}
      //         </span>
      //       </h3>

      //       <p>{node.excerpt}</p>
      //       </Link>
      //     </div>
      //   ))}
      // </div>
  )
}

export default Index

export const query = graphql`
  query {
    latest: allMarkdownRemark {      
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "YYYY-MM-DD ")            
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`

