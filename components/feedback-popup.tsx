import React from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { toast } from 'sonner'
import { db } from '@/db/db' // Adjust the path to your Drizzle configuration
import { comments } from '@/db/schema' // Adjust the path to your schema

interface FeedbackPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: string, isChecked: boolean) => void
  type: 'like' | 'dislike'
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
}) => {
  const [feedback, setFeedback] = React.useState('')
  const [isChecked, setIsChecked] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!feedback.trim()) {
      toast.error('Please provide your feedback before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      // Insert feedback into the database using Drizzle
      await db.insert(comments).values({
        searchId: 1, // Replace with actual `searchId`
        userId: 'user_123', // Replace with the actual logged-in user ID
        commentText: feedback,
        createdAt: new Date(),
      })

      toast.success('Feedback submitted successfully!')
      onSubmit(feedback, isChecked)
      setFeedback('')
      setIsChecked(false)
      onClose()
    } catch (error) {
      console.error('Error saving feedback:', error)
      toast.error('An error occurred while submitting your feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {type === 'like' ? 'What did you like?' : 'What could be improved?'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={isSubmitting}
          >
            <AiOutlineClose className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded-md mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows={4}
            placeholder="Your feedback..."
            disabled={isSubmitting}
          />
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="feedbackCheck"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mr-2"
              disabled={isSubmitting}
            />
            <label htmlFor="feedbackCheck" className="text-sm text-gray-600 dark:text-gray-300">
              I agree to share this feedback
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  )
}
