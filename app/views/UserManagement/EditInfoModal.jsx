import { Modal } from 'antd';
import React from 'react';
import UserInfo from '../UserInfo';

const EditInfoModal = ({ isEditInfoModal, setIsEditInfoModal, user }) => {
  return (
    <Modal open={isEditInfoModal} footer={false} onCancel={() => setIsEditInfoModal(false)} width={1200} centered>
      <div className="p-4">
        <UserInfo />
      </div>
    </Modal>
  );
};

export default EditInfoModal;
