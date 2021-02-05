import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Helmet from 'react-helmet'
import config from '../util/config'
import Header from '../components/Header'

import vueImg from '../data/vue.png'
import reactImg from '../data/react.png'
import jsImg from '../data/js.png'
import cssImg from '../data/CSS.png'
import webpackImg from '../data/webpack.png'

export default function Tags ({data})  {  
  
  const categories = [
    {
      name: 'Vue',
      thumbnail: vueImg,
      tag: 'vue'
    },
    {
      name: 'JavaScript',
      thumbnail: jsImg,
      tag: 'javascript'
    },
    {
      name: 'React',
      thumbnail: reactImg,
      tag: 'react'
    },
    {
      name: 'CSS',
      thumbnail: cssImg,
      tag: 'css'
    },
    {
      name: 'Webpack',
      thumbnail: webpackImg,
      tag: 'webpack'
    }
  ]

    return (
        <Layout>
          <Helmet title={`标签 | ${config.siteTitle}`} />
          <Header title="标签">共{categories.length}个标签</Header>
          <section>
            <div className="container guide-thumbnails">
            {
              categories.map(category => (
                <Link to={`/tags/${category.tag}`} className="image-link" key={category.name}> 
                  <div className="image-wrapper">
                    <img src={category.thumbnail} alt="thumbnail"/>
                  </div>
                  <span>{category.name}</span>
                </Link>              
              ))
            }
            </div>
          </section>                    
        </Layout>
    )
}

export const pageQuery = graphql`
query GuidesQuery {
  allMarkdownRemark(
    sort: { fields: [frontmatter___date], order: DESC }    
  ) {
    edges {
      node {
        id
        fields {
          slug
        }
        frontmatter {
          title
          date(formatString: "MMMM DD, YYYY")
          description
          tags    
          thumbnail {
            childImageSharp {
              fixed(width: 100, height: 100) {
                ...GatsbyImageSharpFixed
              }
            }
          }      
        }
      }
    }
  }
}
`
