import React from 'react';
import ReactDOM from 'react-dom';
import CommentBox from './CommentBox';

ReactDOM.render(
  <CommentBox url="http://localhost:3000/api/comments" pollInterval={2000} />,
  document.getElementById('app')
);
