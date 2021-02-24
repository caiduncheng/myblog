import React from "react"
import Header from '../components/Header'
import { graphql } from 'gatsby'
import Layout from "../components/Layout"

const About = ({data}) => (
  <Layout>
    <Header title="关于">没什么好说的，有空再写<span role="img" aria-label="emoji">😂</span></Header>
  </Layout>
)

export default About

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`