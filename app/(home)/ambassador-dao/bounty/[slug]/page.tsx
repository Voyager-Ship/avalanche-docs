"use client";

import { useState, Suspense, Key, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Mail,
  MessagesSquare,
  MoreVertical,
  Send,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  useDeleteOpportunityComment,
  useEditOpportunityComment,
  useFetchOpportunityComment,
  useFetchOpportunityDetails,
  useReplyOpportunityComment,
  useSubmitOpportunityComment,
  useFetchOpportunityCommentReplies,
} from "@/services/ambassador-dao/requests/opportunity";
import FullScreenLoader from "@/components/ambassador-dao/full-screen-loader";

import Loader from "@/components/ambassador-dao/ui/Loader";
import { Pagination } from "@/components/ambassador-dao/ui/Pagination";
import { AuthModal } from "@/components/ambassador-dao/sections/auth-modal";
import {
  BountyHeader,
  BountySidebar,
  BountyDescription,
} from "@/components/ambassador-dao/bounty/components";
import { useFetchUserDataQuery } from "@/services/ambassador-dao/requests/auth";
import Link from "next/link";

interface CommentAuthor {
  id: string;
  first_name: string;
  last_name: string;
}

interface CommentReply {
  id: string;
  content: string;
  parent_id: string;
  author: CommentAuthor;
  isOptimistic?: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  parent_id?: string;
  isOptimistic?: boolean;
  _count?: {
    replies: number;
  };
}

interface CommentProps {
  comment: Comment;
  opportunityId: string;
}

interface BountySidebarProps {
  bounty: {
    id: string;
    category: string;
    total_budget: number;
    deadline: string;
    proposalsCount: number;
    skills: Array<{ name: string }>;
    custom_questions: any[];
    prize_distribution?: Array<{
      amount: number;
      position: number;
    }>;
  };
}

const GoBackButton = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/ambassador-dao?type=bounties");
  };

  return (
    <button
      onClick={handleGoBack}
      className='flex items-center gap-2 text-[var(--primary-text-color)] hover:text-[var(--white-text-color)] mb-6 bg-[var(--default-background-color)] py-2 px-4 rounded-md border border-[var(--default-border-color)]'
    >
      <ArrowLeft size={16} color='var(--primary-text-color)' />
      <span>Go Back</span>
    </button>
  );
};

interface ReplyProps {
  reply: CommentReply;
  isOptimistic: boolean;
}

const Reply: React.FC<ReplyProps> = ({ reply, isOptimistic = false }) => {
  return (
    <div
      className={`p-4 border border-[var(--default-border-color)] rounded-lg my-2 relative bg-[var(--default-background-color)] bg-opacity-50 ${
        isOptimistic ? "border-blue-400 border-opacity-50" : ""
      }`}
    >
      <div className='flex gap-3'>
        <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center'>
          <span className='text-white text-xs'>
            {reply?.author?.first_name?.substring(0, 2).toUpperCase()}
          </span>
        </div>
        <div className='flex-1'>
          <div className='mb-1'>
            <h3 className='font-medium text-[#FB2C36]'>
              {reply?.author?.first_name} {reply?.author?.last_name}
            </h3>
          </div>
          <p className='text-[var(--secondary-text-color)] text-sm'>
            {reply?.content}
          </p>
        </div>
      </div>
    </div>
  );
};

interface CommentRepliesProps {
  commentId: string;
  opportunityId: string;
  repliesCount: number;
}

const CommentReplies: React.FC<CommentRepliesProps> = ({
  commentId,
  opportunityId,
  repliesCount,
}) => {
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [optimisticReplies, setOptimisticReplies] = useState<CommentReply[]>(
    []
  );
  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [repliesLoaded, setRepliesLoaded] = useState<boolean>(false);
  const { data: userData } = useFetchUserDataQuery();

  const { refetch } = useFetchOpportunityCommentReplies(commentId);

  const loadReplies = async () => {
    setIsLoading(true);
    try {
      const { data: fetchedReplies } = await refetch();

      if (fetchedReplies && Array.isArray(fetchedReplies)) {
        const filteredReplies = fetchedReplies.filter(
          (reply) => reply.parent_id === commentId
        );
        setReplies(filteredReplies);
        const confirmedReplyKeys = new Set(
          filteredReplies.map((r) => `${r.content}-${r.parent_id}`)
        );
        setOptimisticReplies((prev) =>
          prev.filter(
            (r) => !confirmedReplyKeys.has(`${r.content}-${r.parent_id}`)
          )
        );
      }
      setRepliesLoaded(true);
      setShowReplies(true);
    } catch (error) {
      setIsError(true);
      console.error("Failed to load replies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const { mutateAsync: replyComment } =
    useReplyOpportunityComment(opportunityId);

  const handleReplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userData) {
      setOpenAuthModal(true);
    } else {
      if (replyText.trim() !== "") {
        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticReply: CommentReply = {
          id: optimisticId,
          content: replyText,
          parent_id: commentId,
          author: {
            id: userData?.id || "",
            first_name: userData?.first_name || "You",
            last_name: userData?.last_name || "",
          },
          isOptimistic: true,
        };

        setOptimisticReplies((prev) => [...prev, optimisticReply]);

        const replyContent = replyText;
        setReplyText("");
        setIsReplying(false);

        setShowReplies(true);
        if (!repliesLoaded && repliesCount > 0) {
          loadReplies();
        }

        try {
          await replyComment({
            content: replyContent,
            parent_id: commentId,
          });

          if (repliesLoaded) {
            loadReplies();
          }
        } catch (error) {
          console.error("Failed to post reply:", error);
          setOptimisticReplies((prev) =>
            prev.filter((r) => r.id !== optimisticId)
          );
        }
      }
    }
  };

  const handleCancelReply = () => {
    setReplyText("");
    setIsReplying(false);
  };

  const toggleReplies = () => {
    if (!repliesLoaded && repliesCount > 0) {
      loadReplies();
    } else {
      setShowReplies(!showReplies);
    }
  };

  const displayReplies = [...replies, ...optimisticReplies];

  const displayRepliesCount = repliesLoaded
    ? replies.length + optimisticReplies.length
    : repliesCount;

  if (displayRepliesCount === 0 && !isReplying && !isLoading) {
    return (
      <div className='ml-12 my-2'>
        <button
          type='button'
          onClick={() => setIsReplying(!isReplying)}
          className='hover:text-[var(--white-text-color)] text-[var(--secondary-text-color)] px-4 rounded-md text-sm transition'
        >
          Reply
        </button>

        {isReplying && (
          <div className='mt-2'>
            <form onSubmit={handleReplySubmit}>
              <textarea
                className='w-full border border-[var(--default-border-color)] rounded-md p-3 text-[var(--white-text-color)] resize-none focus:outline-none bg-[var(--default-background-color)]'
                placeholder='Write a reply...'
                rows={1}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              ></textarea>

              {replyText.trim() !== "" && (
                <div className='flex justify-end gap-2 mt-2'>
                  <button
                    type='button'
                    onClick={handleCancelReply}
                    className='px-4 py-1 text-[var(--secondary-text-color)] hover:text-[var(--white-text-color)] rounded-md text-sm transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition'
                  >
                    Reply
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        <AuthModal
          isOpen={openAuthModal}
          onClose={() => setOpenAuthModal(false)}
          stopRedirection={true}
        />
      </div>
    );
  }

  return (
    <div className='ml-12'>
      <div className='flex items-center gap-2 my-2'>
        {displayRepliesCount > 0 && (
          <button
            type='button'
            onClick={toggleReplies}
            className='text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition'
          >
            {isLoading ? (
              <span>Loading replies...</span>
            ) : (
              <>
                {displayRepliesCount}{" "}
                {displayRepliesCount === 1 ? "Reply" : "Replies"}
                <span className='text-xs'>{showReplies ? "▲" : "▼"}</span>
              </>
            )}
          </button>
        )}

        <span className='text-gray-500'>•</span>

        <button
          type='button'
          onClick={() => setIsReplying(!isReplying)}
          className='hover:text-[var(--white-text-color)] text-[var(--secondary-text-color)] text-sm transition'
        >
          Reply
        </button>
      </div>

      {isReplying && (
        <div className='mt-2'>
          <form onSubmit={handleReplySubmit}>
            <textarea
              className='w-full border border-[var(--default-border-color)] rounded-md p-3 text-[var(--white-text-color)] resize-none focus:outline-none bg-[var(--default-background-color)]'
              placeholder='Write a reply...'
              rows={1}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            ></textarea>

            {replyText.trim() !== "" && (
              <div className='flex justify-end gap-2 mt-2'>
                <button
                  type='button'
                  onClick={handleCancelReply}
                  className='px-4 py-1 text-[var(--secondary-text-color)] hover:text-[var(--white-text-color)] rounded-md text-sm transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition'
                >
                  Reply
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      <AuthModal
        isOpen={openAuthModal}
        onClose={() => setOpenAuthModal(false)}
        stopRedirection={true}
      />

      {isError && !optimisticReplies.length && (
        <div className='text-red-500 text-sm my-2'>Failed to load replies</div>
      )}

      {showReplies && displayReplies.length > 0 && (
        <div className='space-y-2 mt-2 pl-2 border-l-2 border-[var(--default-border-color)]'>
          {displayReplies.map((reply, idx) => (
            <Reply
              key={`reply-${reply.id}-${idx}`}
              reply={reply}
              isOptimistic={!!reply.isOptimistic}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comment: React.FC<CommentProps> = ({ comment, opportunityId }) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(comment.content);
  const optionsRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: editComment } = useEditOpportunityComment(comment.id);
  const { mutateAsync: deleteComment } = useDeleteOpportunityComment(
    comment.id
  );
  const { data: userData } = useFetchUserDataQuery();

  const isEditable = userData?.id === comment?.author?.id;
  const repliesCount = comment._count?.replies || 0;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editText.trim() === "") return;

    const originalContent = comment.content;

    comment.content = editText;
    setIsEditing(false);

    try {
      await editComment({
        content: editText,
      });
    } catch (error) {
      console.error("Failed to edit comment:", error);
      comment.content = originalContent;
      setEditText(originalContent);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment();
      setShowOptions(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
      setShowOptions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`group ${
        comment.isOptimistic ? "border-blue-400 border-opacity-50" : ""
      }`}
    >
      <div className='p-4 border border-[var(--default-border-color)] rounded-lg my-2 relative'>
        <div className='flex gap-3 w-full'>
          <div className='w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center'>
            <span className='text-white text-sm'>
              {comment?.author?.first_name?.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className='flex-1'>
            <div className='flex justify-between items-start mb-1 w-full'>
              <h3 className='font-medium text-[#FB2C36]'>
                {comment?.author?.first_name} {comment?.author?.last_name}
              </h3>
              {isEditable && (
                <button
                  className='p-1 text-[var(--secondary-text-color)] hover:text-[var(--white-text-color)] focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={toggleOptions}
                  aria-label='Comment options'
                >
                  <MoreVertical size={16} color='var(--white-text-color)' />
                </button>
              )}

              {showOptions && isEditable && (
                <div
                  ref={optionsRef}
                  className='absolute right-4 top-4 bg-[var(--default-background-color)] rounded-md shadow-lg z-10 py-1 min-w-[100px]'
                >
                  <button
                    className='w-full text-left px-4 py-2 text-sm text-[var(--white-text-color)] hover:bg-gray-200 dark:hover:bg-gray-800'
                    onClick={() => {
                      setIsEditing(true);
                      setShowOptions(false);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className='w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={handleDeleteComment}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className='mt-2'>
                <textarea
                  className='w-full border border-[var(--default-border-color)] rounded-md p-3 text-[var(--white-text-color)] resize-none focus:outline-none bg-[var(--default-background-color)]'
                  placeholder='Edit your comment'
                  rows={2}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                ></textarea>
                <div className='flex justify-end gap-2 mt-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setEditText(comment?.content);
                      setIsEditing(false);
                    }}
                    className='px-4 py-1 text-[var(--secondary-text-color)] hover:text-[var(--white-text-color)] rounded-md text-sm transition'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition'
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <p className='text-[var(--secondary-text-color)] text-sm'>
                {comment?.content}
              </p>
            )}
          </div>
        </div>
      </div>

      {!isEditing && !comment.isOptimistic && (
        <CommentReplies
          commentId={comment.id}
          opportunityId={opportunityId}
          repliesCount={repliesCount}
        />
      )}
    </div>
  );
};

interface CommentsSectionProps {
  id: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ id }) => {
  const [newComment, setNewComment] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [metadata, setMetadata] = useState({
    total: 0,
    last_page: 1,
    current_page: 1,
    per_page: 10,
    prev_page: null,
    next_page: null,
  });

  const [openAuthModal, setOpenAuthModal] = useState(false);

  const { data: userData } = useFetchUserDataQuery();

  const {
    data: commentsData,
    isLoading: isLoadingComments,
    refetch,
  } = useFetchOpportunityComment(id, {
    page: currentPage,
    per_page: 10,
  });

  useEffect(() => {
    if (commentsData) {
      if (commentsData.data && Array.isArray(commentsData.data)) {
        const sortedComments = [...commentsData.data];
        setComments(sortedComments);
        const confirmedCommentKeys = new Set(
          sortedComments.map((c: any) => `${c.content}-${c.author.id}`)
        );

        setOptimisticComments((prev) =>
          prev.filter(
            (c) => !confirmedCommentKeys.has(`${c.content}-${c.author.id}`)
          )
        );
      }

      if (commentsData.metadata) {
        setMetadata(commentsData.metadata);
      }
    }
  }, [commentsData]);

  const displayComments =
    currentPage === 1 ? [...optimisticComments, ...comments] : [...comments];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (page !== 1) {
      setOptimisticComments([]);
    }
  };

  const { mutateAsync: submitComment, isPending: isSubmitting } =
    useSubmitOpportunityComment(id);

  const handleSubmitComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userData) {
      setOpenAuthModal(true);
    } else {
      if (newComment.trim() !== "") {
        const optimisticId = `optimistic-${Date.now()}`;
        const commentContent = newComment;

        const optimisticComment: Comment = {
          id: optimisticId,
          content: commentContent,
          author: {
            id: userData?.id || "",
            first_name: userData?.first_name || "You",
            last_name: userData?.last_name || "",
          },
          isOptimistic: true,
          _count: {
            replies: 0,
          },
        };

        setNewComment("");
        setIsFocused(false);

        setOptimisticComments((prev) => [optimisticComment, ...prev]);

        try {
          await submitComment({
            content: commentContent,
            parent_id: "",
          });

          if (currentPage !== 1) {
            setCurrentPage(1);
          } else {
            refetch();
          }
        } catch (error) {
          console.error("Failed to submit comment:", error);
          setOptimisticComments((prev) =>
            prev.filter((c) => c.id !== optimisticId)
          );
        }
      }
    }
  };

  const handleCancelComment = () => {
    setNewComment("");
    setIsFocused(false);
  };

  return (
    <div className='mt-8 border-t border-[var(--default-border-color)] pt-6'>
      <div className='flex items-center gap-2 mb-4'>
        <MessagesSquare size={16} color='#9F9FA9' />
        <h2 className='text-lg font-semibold'>
          {(metadata.total || 0) + optimisticComments.length} Comments
        </h2>
      </div>

      <form onSubmit={handleSubmitComment} className='mt-6 relative'>
        <textarea
          className='w-full border border-[var(--default-border-color)] bg-transparent rounded-md p-3 text-[var(--white-text-color)] resize-none focus:outline-none'
          placeholder='Write Comments'
          rows={isFocused || newComment.length > 0 ? 2 : 1}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          maxLength={280}
        ></textarea>

        {(isFocused || newComment.trim() !== "") && (
          <>
            <div className='text-[var(--secondary-text-color)] text-xs flex justify-end mt-1'>
              {`${280 - newComment.length} characters left`}
            </div>
            <div className='flex justify-end gap-2 mt-2'>
              <button
                type='button'
                onClick={handleCancelComment}
                className='px-4 py-2 text-[var(--secondary-text-color)] hover:text-[var(--white-text-color)] rounded-md text-sm transition'
              >
                Cancel
              </button>
              <button
                type='submit'
                className={`px-4 py-2 bg-red-500 text-white rounded-md text-sm transition ${
                  newComment.trim() === "" || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-600"
                }`}
                disabled={newComment.trim() === "" || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Comment"}
              </button>
            </div>
          </>
        )}
      </form>

      {isLoadingComments ? (
        <div className='flex justify-center my-8'>
          <Loader />
        </div>
      ) : (
        <>
          <div className='space-y-4 mt-6'>
            {displayComments.length === 0 ? (
              <p className='text-[var(--secondary-text-color)] text-center py-8'>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              displayComments.map((comment, index) => (
                <Comment
                  key={`comment-${comment.id}-${index}`}
                  comment={comment}
                  opportunityId={id}
                />
              ))
            )}
          </div>

          {metadata.last_page > 1 && (
            <Pagination
              metadata={metadata}
              onPageChange={handlePageChange}
              className='my-8'
            />
          )}

          <AuthModal
            isOpen={openAuthModal}
            onClose={() => setOpenAuthModal(false)}
          />
        </>
      )}
    </div>
  );
};

const AmbasssadorDaoSingleBountyPage = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const { data, isLoading: isFetchingOpportunityDetails } =
    useFetchOpportunityDetails(slug);

  const headerData = {
    id: data?.id,
    title: data?.title,
    requirements: data?.requirements,
    point_of_contact_email: data?.point_of_contact_email,
    point_of_contact: data?.point_of_contact,
    companyName: data?.created_by?.company_profile?.name || "Unknown",
    companyLogo: data?.created_by?.company_profile?.logo,
    createdBy: `${data?.created_by?.first_name} ${data?.created_by?.last_name}`,
    type: data?.type,
    deadline: data?.end_date,
    proposalsCount: data?.max_winners || 0,
    skills: data?.skills || [],
    _count: data?._count || 0,
  };

  const extractDescriptionData = (apiResponse: {
    description: string;
    title: string;
  }) => {
    const descriptionParagraphs = apiResponse?.description
      ? apiResponse.description
          .split("\n\n")
          .filter((para) => para.trim() !== "")
      : [];

    const titleParagraph = apiResponse?.title
      ? apiResponse?.title
      : "About the Job";

    const contentParagraphs = descriptionParagraphs;

    return {
      title: titleParagraph,
      content: contentParagraphs,
    };
  };

  const sidebarData = {
    id: data?.id,
    category: data?.category,
    status: data?.status,
    total_budget: data?.total_budget || 0,
    deadline: data?.end_date,
    proposalsCount: data?._count?.submissions,
    skills: data?.skills || [],
    custom_questions: data?.custom_questions || [],
    prize_distribution: data?.prize_distribution,
  };

  if (isFetchingOpportunityDetails) {
    return <FullScreenLoader />;
  }

  return (
    <div className='text-[var(--white-text-color)] min-h-screen bg-[var(--black-background-color)]'>
      <div className='max-w-7xl mx-auto my-6'>
        <GoBackButton />
      </div>
      {!isFetchingOpportunityDetails && (
        <div className='max-w-7xl mx-auto px-4 py-8 border border-[var(--default-border-color)] bg-[var(--default-background-color)] rounded-lg shadow-sm my-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='md:col-span-2 flex flex-col'>
              <BountyHeader bounty={headerData} />

              {headerData?.requirements && (
                <div className='border text-[var(--primary-text-color)] border-[var(--default-border-color)] p-4 mb-6 rounded-md'>
                  <h2 className='mb-2 font-medium'>Requirements</h2>
                  <p className='text-[13px] text-[var(--secondary-text-color)] whitespace-pre-line'>
                    {headerData?.requirements}
                  </p>
                </div>
              )}

              <div className='border text-[var(--primary-text-color)] border-[var(--default-border-color)] p-4 mb-6 rounded-md'>
                <h2 className='mb-4 font-medium'>Contact Information</h2>
                <p className='text-[13px] text-[var(--secondary-text-color)] whitespace-pre-line'>
                  For questions or clarification, please contact
                </p>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-6'>
                  <a
                    href={`mailto://${headerData?.point_of_contact_email}`}
                    className='flex items-center justify-center gap-2 bg-[var(--default-border-color)] transition-colors rounded-lg py-3 px-4'
                  >
                    <Mail color='var(--white-text-color)' size={16} />
                    <span className='text-[var(--white-text-color)] text-sm font-medium'>
                      Email
                    </span>
                  </a>

                  <Link
                    href={`https://t.me/${headerData?.point_of_contact}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center justify-center gap-2 bg-[var(--default-border-color)] transition-colors rounded-lg py-3 px-4'
                  >
                    <div className='dark:bg-[#fff] bg-[#000] rounded-full p-1'>
                      <Send color='var(--black-background-color)' size={10} />
                    </div>
                    <span className='text-[var(--white-text-color)] text-sm font-medium'>
                      Telegram
                    </span>
                  </Link>
                </div>
              </div>

              <div className='block md:hidden my-6'>
                <BountySidebar bounty={sidebarData} />
              </div>

              <BountyDescription data={extractDescriptionData(data)} />
              <CommentsSection id={slug} />
            </div>

            <div className='hidden md:block md:col-span-1'>
              <BountySidebar bounty={sidebarData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const BountyDetailsWithSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AmbasssadorDaoSingleBountyPage />
    </Suspense>
  );
};

export default BountyDetailsWithSuspense;
