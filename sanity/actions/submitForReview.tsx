import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from 'sanity'

/**
 * "Submit for Review" document action.
 * Sets the editorial status to `in_review` so it appears in the Approval Queue
 * for Admins/Editors. Does NOT publish — writers can never publish directly.
 */
export const SubmitForReviewAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { patch } = useDocumentOperation(props.id, props.type)
  const status = (props.draft?.status ?? props.published?.status) as string | undefined
  const alreadySubmitted = status === 'in_review'

  return {
    label: alreadySubmitted ? 'Submitted for Review' : 'Submit for Review',
    tone: 'primary',
    disabled: alreadySubmitted || !props.draft,
    onHandle: () => {
      patch.execute([{ set: { status: 'in_review' } }])
      props.onComplete()
    },
  }
}
