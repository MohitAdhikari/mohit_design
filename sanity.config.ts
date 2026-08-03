'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schema } from './sanity/schemaTypes'
import { structure } from './sanity/structure'
import { SubmitForReviewAction } from './sanity/actions/submitForReview'
import { PreviewAction } from './sanity/actions/preview'
import { TagArticlesView } from './sanity/components/TagArticlesView'
import { TagDeleteAction, TagMergeAction } from './sanity/actions/tagActions'

const WRITER_BLOCKED_ACTIONS = ['publish', 'unpublish', 'schedule', 'duplicate', 'delete']

// Content types that follow the editorial approval workflow. Writers can draft
// and submit these for review, but never publish/schedule/delete them directly.
const WORKFLOW_TYPES = ['newsPost', 'interview', 'guide']

export default defineConfig({
  basePath: '/studio',
  projectId: projectId || 'nlydr3l6',
  dataset: dataset || 'production',
  schema,
  document: {
    views: (prev: any[], context: { schemaType: string }) => {
      if (context.schemaType === 'tag') {
        return [
          ...prev,
          {
            id: 'tag-articles',
            title: 'Articles',
            icon: () => '📄',
            component: TagArticlesView as any,
          },
        ]
      }
      return prev
    },
    // Role-aware editorial workflow.
    // Writers cannot publish/unpublish/schedule/delete — they can only Submit for Review.
    // Admins/Editors keep full actions. Falls back to full actions when roles are unknown.
    actions: (prev, context) => {
      const roles = context?.currentUser?.roles?.map((r) => r.name) || []
      const isPrivileged =
        roles.includes('administrator') || roles.includes('editor')
      const isWriter = roles.includes('writer') && !isPrivileged

      // Tag-specific actions
      if (context?.schemaType === 'tag') {
        const filtered = prev.filter(
          (action) => (action.action as string) !== 'delete'
        )
        return [...filtered, TagDeleteAction, TagMergeAction]
      }

      // Editorial workflow for newsPost / guide / interview
      if (!WORKFLOW_TYPES.includes(context?.schemaType)) return prev

      // Add live Preview for newsPost / guide documents.
      if (!isWriter) return [...prev, PreviewAction]

      const filtered = prev.filter(
        (action) => !WRITER_BLOCKED_ACTIONS.includes((action.action as string) ?? '')
      )
      return [...filtered, SubmitForReviewAction, PreviewAction]
    },
  },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
