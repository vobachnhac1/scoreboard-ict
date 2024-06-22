import { CommentOutlined, LikeFilled, LikeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Divider } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const Post = () => {
  const { t } = useTranslation();
  return (
    <div className="shadow-md bg-white p-8 pb-2 rounded-lg w-[800px]">
      <div className="flex">
        <Avatar size={48} icon={<UserOutlined />} />
        <div className="ml-4">
          <div className="font-semibold">Nguyen Van A</div>
          <div className="text-gray-500">10:00 20/10/2021</div>
        </div>
      </div>

      <div className="mt-8">Noi dung bai post</div>

      {/* Reactions & stat */}
      <div className="mt-4 flex justify-between w-full items-center">
        <div>
          <LikeFilled className="mr-2 text-sky-500" /> 3 {t('likes')}
        </div>
        <div className="flex gap-8">
          <div>5 {t('comments')}</div>
          <div>8 {t('shares')}</div>
        </div>
      </div>
      <Divider className="my-3" />

      {/* Actions */}
      <div className="mt-4 flex justify-between w-full items-center">
        <button className="text-lg hover:bg-gray-300 w-1/2 rounded-lg py-1">
          <LikeOutlined className="mr-4" />
          {t('like')}
        </button>

        <button className="text-lg hover:bg-gray-300 w-1/2 rounded-lg py-1">
          <CommentOutlined className="mr-4" />
          {t('comment')}
        </button>
      </div>
      <Divider className="my-3" />
    </div>
  );
};

export default Post;
