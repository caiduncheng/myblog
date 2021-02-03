/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */

// You can delete this file if you're not using it

const { createFilePath }  = require(`gatsby-source-filesystem`)
const path = require('path')

exports.onCreateNode = ({ node, getNode, actions }) => {
  // const fileNode = getNode(node.parent)
  // const parsedFilePath = path.parse(fileNode.relativePath)
  // if (Object.prototype.hasOwnProperty.call(node.frontmatter, 'slug')) {
  //   slug = `/${node.frontmatter.slug}/`
  // } else {
  //   slug = `/${parsedFilePath.dir}/`
  // }

  // createNodeField({
  //   name: 'slug',
  //   node,
  //   value: slug,
  // })
  const { createNodeField } = actions
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode, basePath: `data` })    
    createNodeField({
      node,
      name: `slug`,
      value: slug
    })
  }
}

exports.createPages = async ({ graphql, actions }) => {

  const tagPage = path.resolve('./src/templates/tag.js')
  const postPage = path.resolve('./src/templates/post.js')

  const { createPage } = actions
  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              title
              tags
              template
            }
            fields {
              slug
            }
          }
        }
      }
    }
  `)

  const all = result.data.allMarkdownRemark.edges
  const post = all.filter(post => post.node.frontmatter.template === 'post')  
  const tagSet = new Set()

  post.forEach((post, i) => {

    if(post.node.frontmatter.tags) {
      post.node.frontmatter.tags.forEach(tag => {
        tagSet.add(tag)
      })
    }
    
    createPage({
      path: post.node.fields.slug,
      component: postPage,
      context: {
        slug: post.node.fields.slug
      }
    })
  })
  
  const tags = Array.from(tagSet)
  console.log(tags)
  tags.forEach(tag => {
    createPage({
      path: `/tags/${slugify(tag)}`,
      component: tagPage,
      context: {
        tag
      }
    })
  })
}

function slugify(str) {
  return (
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map((x) => x.toLowerCase())
      .join('-')
  )
}