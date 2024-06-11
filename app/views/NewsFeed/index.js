import { CommentOutlined, LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React from 'react';
import Post from './Post';

const NewsFeed = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <Post />
    </div>
  );
};

export default NewsFeed;
