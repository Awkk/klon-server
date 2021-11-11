import { registerEnumType } from "type-graphql";

export enum PostSort {
  createdDate = "createdDate",
  score = "score",
  commentsCount = "commentsCount",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(PostSort, {
  name: "PostSort",
});

registerEnumType(SortOrder, {
  name: "SortOrder",
});
