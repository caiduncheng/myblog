import React, { useState } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { useFlexSearch } from 'react-use-flexsearch'
import * as queryString from 'query-string'

import Posts from './Posts'

export default function Search({ posts, location, navigate }) {
  const { search } = queryString.parse(location.search)
  const [query, setQuery] = useState(search || '')
  const { localSearchPages } = useStaticQuery(graphql`
    query {
      localSearchPages {
        index
        store
      }
    }
  `)

  const results = useFlexSearch(
    query,
    localSearchPages.index,
    localSearchPages.store
  )

  return (
    <>
      <input
        id="search"
        type="search"
        placeholder="搜索文章..."
        value={query}
        onChange={(e) => {
          navigate(e.target.value ? `/blog/?search=${e.target.value}` : '')
          setQuery(e.target.value)
        }}
      />
      <section>
        {query ? (
          results.length > 0 ? (
            <Posts data={results} />
          ) : (
            <p>没有搜索到文章</p>
          )
        ) : (     
          <Posts data={posts} showYears/>
        )}
      </section>
    </>
  )
}