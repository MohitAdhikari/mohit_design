'use client'

import { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { Card, Stack, Text, Box, Inline, Button, Flex } from '@sanity/ui'
import { useRouter } from 'sanity/router'
import { sortByTimestamp } from '../../lib/sortUtils'

interface Article {
  _id: string
  _type: string
  title: string
  slug: { current: string }
  publishDate?: string
  _createdAt: string
}

export function TagArticlesView(props: { document: { displayed: { _id: string } } }) {
  const client = useClient({ apiVersion: '2023-01-01' })
  const router = useRouter()
  const tagId = props.document.displayed._id.replace(/^drafts\./, '')
  const [articles, setArticles] = useState<Article[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function load() {
      const data = await client.fetch<{
        articles: Article[]
        count: number
      }>(`{
        "count": count(*[_type in ["newsPost", "guide", "interview"] && references($tagId)]),
        "articles": *[_type in ["newsPost", "guide", "interview"] && references(^._id)] | order(dateTime(coalesce(publishDate, _createdAt)) desc)[0...50] {
          _id, _type, title, slug, publishDate, _createdAt
        }
      }`, { tagId })
      setArticles(sortByTimestamp(data.articles || []))
      setCount(data.count || 0)
    }
    load()
  }, [client, tagId])

  const openArticle = (article: Article) => {
    router.navigateUrl({ path: `/intent/edit/id=${article._id};type=${article._type}/` })
  }

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

  return (
    <Stack space={4} padding={4}>
      <Card border radius={2} padding={4} tone="primary">
        <Text size={2} weight="semibold">
          {count} {count === 1 ? 'article' : 'articles'} use this tag
        </Text>
      </Card>

      {articles.length === 0 ? (
        <Text muted>No articles use this tag.</Text>
      ) : (
        <Box>
          {articles.map((article) => (
            <Card
              key={article._id}
              border
              radius={2}
              padding={3}
              marginBottom={3}
              style={{ cursor: 'pointer' }}
              onClick={() => openArticle(article)}
            >
              <Flex justify="space-between" align="center">
                <Stack space={2}>
                  <Text weight="semibold">{article.title}</Text>
                  <Inline space={3}>
                    <Text size={1} muted>
                      {article._type === 'newsPost' ? 'News' : article._type === 'guide' ? 'Guide' : 'Interview'}
                    </Text>
                    <Text size={1} muted>•</Text>
                    <Text size={1} muted>{formatDate(article.publishDate || article._createdAt)}</Text>
                  </Inline>
                </Stack>
                <Button mode="ghost" size={0} text="Open" onClick={() => openArticle(article)} />
              </Flex>
            </Card>
          ))}
        </Box>
      )}
    </Stack>
  )
}
