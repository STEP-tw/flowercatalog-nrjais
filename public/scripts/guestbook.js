const getFormattedComments = function (comments) {
  return comments.reduce(function (commentsHTML, comment) {
    commentsHTML += '------------------------------------------'
    commentsHTML += `<p id="name"> ${comment.name} </p>`
    commentsHTML += `<p id="time"> ${comment.time} </p>`
    commentsHTML += `<p id="comment"> ${comment.comment} </p>`
    return commentsHTML;
  }, "");
}

const insertCommentData = function () {
  let comments = JSON.parse(this.response);
  let commentsDiv = document.getElementById('comments');
  commentsDiv.innerHTML = getFormattedComments(comments);
}

const loadComments = function () {
  let req = new XMLHttpRequest();
  req.open('get', '/data');
  req.addEventListener('load', insertCommentData);
  req.send();
}

window.onload = loadComments;

