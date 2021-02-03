import React, { useMemo } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../components/layout"
import Blurb from '../components/Blurb'
import Recommendations from '../components/Recommendation'
import { getSimplifiedPosts } from '../util'

const Index = ({ data }) => {  
  const recommended = data.recommended.edges    
  const simplifiedRecommended = useMemo(() => getSimplifiedPosts(recommended, {thumbnails: true}), [recommended])    
  
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
      <Blurb title="我是Caidc." />      
      <div className="container index">
        <Section title="推荐阅读" button>
          <Recommendations data={simplifiedRecommended}/>
        </Section>
      </div>
      </Layout>
  )
}

export default Index

export const query = graphql`
  query {
    recommended: allMarkdownRemark(
      limit: 5      
      filter: { frontmatter: { categories: { in: "FrontPage" } } }
    ) {      
      totalCount
      edges {
        node {
          id
          frontmatter {
            title
            description
            tags
            date(formatString: "YYYY-MM-DD ")        
            thumbnail {
              childImageSharp {
                fixed(width: 100, height: 100) {
                  ...GatsbyImageSharpFixed
                }
              }
            }   
          }
          fields {
            slug
          }          
        }
      }
    }
  }
`

