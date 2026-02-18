import React from 'react';

import { Modal, Avatar, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';

const NotificationModal = ({ isNotifModal, setIsNotifModal, userSelected }) => {
  const { t } = useTranslation();

  return (
    <Modal open={isNotifModal} footer={false} onCancel={() => setIsNotifModal(false)} width={800}>
      <div className="p-4">
        <div className="flex items-center gap-4">
          <Avatar size={48} icon={<UserOutlined />} />
          <div>{userSelected.name}</div>
        </div>

        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 4 }}
          className="outline-none border-none rounded-none custom-textarea mt-4"
          placeholder="Type your message here..."
        />

        <div className="flex justify-end mt-4">
          <Button type="primary" size="large">
            {t('send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
