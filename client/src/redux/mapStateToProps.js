export const mapAlertToProps = (reduxState) => {
  return {
    alert: reduxState.alertState,
  };
};


export const mapUserAndProfileToProps = (reduxState) => {
  return {
    user: reduxState.userState.user,
    alert: reduxState.alertState,
    createdUser:reduxState.userState.createdUser,
    loading:reduxState.userState.loading,
    singleUser:reduxState.userState.singleUser,
    alert:reduxState.alertState,
  };
};

export const mapStateToPropsPost=(reduxState)=>{
  return {
    post: reduxState.postState.post,
    posts:reduxState.postState.posts,
    postLoading:reduxState.postState.loading,
    authUser:reduxState.userState.user,
    alert: reduxState.alertState,
  }
}
