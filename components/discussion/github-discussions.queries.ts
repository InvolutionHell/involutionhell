/**
 * @description GitHub Discussion 模块用到的 GraphQL 查询与 Mutation。
 * 拆分成独立文件，方便在 service 层按需引用，也便于未来做单元测试时复用。
 */

export const REPOSITORY_METADATA_QUERY = /* GraphQL */ `
  query ResolveRepositoryMetadata($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      id
      discussionCategories(first: 50) {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

export const SEARCH_DISCUSSION_QUERY = /* GraphQL */ `
  query SearchDiscussionByDocId($query: String!) {
    search(query: $query, first: 1, type: DISCUSSION) {
      nodes {
        ... on Discussion {
          id
          number
          title
          url
          createdAt
        }
      }
    }
  }
`;

export const DISCUSSION_WITH_COMMENTS_QUERY = /* GraphQL */ `
  query DiscussionWithComments(
    $id: ID!
    $commentPageSize: Int!
    $commentCursor: String
    $replyPageSize: Int!
  ) {
    node(id: $id) {
      ... on Discussion {
        id
        number
        title
        url
        body
        createdAt
        author {
          login
          avatarUrl
          url
        }
        comments(first: $commentPageSize, after: $commentCursor) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            body
            bodyHTML
            bodyText
            createdAt
            url
            isAnswer
            author {
              login
              avatarUrl
              url
            }
            replies(first: $replyPageSize) {
              totalCount
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                body
                bodyHTML
                bodyText
                createdAt
                url
                author {
                  login
                  avatarUrl
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_DISCUSSION_MUTATION = /* GraphQL */ `
  mutation CreateDiscussion(
    $repositoryId: ID!
    $categoryId: ID!
    $title: String!
    $body: String!
  ) {
    createDiscussion(
      input: {
        repositoryId: $repositoryId
        categoryId: $categoryId
        title: $title
        body: $body
      }
    ) {
      discussion {
        id
        number
        title
        url
        createdAt
      }
    }
  }
`;

export const ADD_DISCUSSION_COMMENT_MUTATION = /* GraphQL */ `
  mutation AddDiscussionComment($discussionId: ID!, $body: String!) {
    addDiscussionComment(input: { discussionId: $discussionId, body: $body }) {
      comment {
        id
        body
        bodyHTML
        bodyText
        createdAt
        url
        author {
          login
          avatarUrl
          url
        }
      }
    }
  }
`;

export const ADD_DISCUSSION_REPLY_MUTATION = /* GraphQL */ `
  mutation AddDiscussionReply($commentId: ID!, $body: String!) {
    addDiscussionReply(input: { commentId: $commentId, body: $body }) {
      comment {
        id
        body
        bodyHTML
        bodyText
        createdAt
        url
        author {
          login
          avatarUrl
          url
        }
      }
    }
  }
`;
