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

export enum SortPeriod {
  day = "day",
  week = "week",
  month = "month",
  year = "year",
  all = "all",
}
registerEnumType(PostSort, {
  name: "PostSort",
});

registerEnumType(SortOrder, {
  name: "SortOrder",
});

registerEnumType(SortPeriod, {
  name: "SortPeriod",
});
