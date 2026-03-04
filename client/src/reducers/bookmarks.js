const bookmarksReducer = (state = { data: [] }, action) => {
  switch (action.type) {
    case "FETCH_BOOKMARKS":
      return { ...state, data: action.payload };
    default:
      return state;
  }
};

export default bookmarksReducer;
