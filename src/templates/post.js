import React, {useEffect} from 'react'
import { Link, graphql } from 'gatsby'
import Helmet from 'react-helmet'
import Img from 'gatsby-image'

import Layout from '../components/Layout'
import Comments from '../components/Comment'

import config from '../util/config'
import { slugify } from '../util'

export default function PostTemplate({ data, pageContext }) {
  const post = data.markdownRemark
  const { tags, thumbnail, title, date, description } = post.frontmatter

  const commentBox = React.createRef()

  useEffect(() => {
    const commentScript = document.createElement('script')
    const theme =
      typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark'
        ? 'github-dark'
        : 'github-light'
    commentScript.async = true
    commentScript.src = 'https://utteranc.es/client.js'
    commentScript.setAttribute('repo', 'caiduncheng/comments') // CHANGE THIS if you're just going to clone this repo and use the code. Do not test your code using my repo.
    commentScript.setAttribute('issue-term', 'pathname')
    commentScript.setAttribute('id', 'utterances')
    commentScript.setAttribute('theme', 'github-light')
    commentScript.setAttribute('crossorigin', 'anonymous')
    if (commentBox && commentBox.current) {
      commentBox.current.appendChild(commentScript)
    } else {
      console.log(`Error adding utterances comments on: ${commentBox}`)
    }
  }, []) // eslint-disable-line

  return (
    <Layout>
      <Helmet title={`${post.frontmatter.title} | ${config.siteTitle}`} />
      <div className="container">
        <article>
          <header className="article-header">
            <div className="container">
              <div className="thumb">
                {thumbnail && (
                  <Img
                    fixed={thumbnail.childImageSharp.fixed}
                    className="post-thumbnail"
                  />
                )}
                <div>
                  <h1>{title}</h1>
                  <div className="post-meta">
                    <div>
                      <Link to="/me">Caidc</Link> 发布于{' '}
                      <time>{date}</time>
                    </div>
                    {tags && (
                      <div className="tags">
                        {tags.map((tag) => (
                          <Link
                            key={tag}
                            to={`/tags/${slugify(tag)}`}
                            className={`tag-${tag}`}
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {description && <p className="description">{description}</p>}
          </header>
          <div
            className="article-post"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
      </div>
      <div className="container">
        <div id="comments">
          <h2>评论</h2>
          <Comments commentBox={commentBox} />
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt
      fields {
        slug
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        tags       
        description 
        thumbnail {
          childImageSharp {
            fixed(width: 150, height: 150) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    }
  }
`
