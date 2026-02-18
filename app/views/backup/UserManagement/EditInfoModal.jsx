import { Modal } from 'antd';
import React from 'react';
import FormAddUser from '../../components/FormAddUser';

const AddStudentModal = ({ isAddStudentModal, setIsAddStudentModal, userInfo }) => {
  return (
    <Modal open={isAddStudentModal} footer={false} onCancel={() => setIsAddStudentModal(false)} width={1200} centered>
      <div className="p-4">
        <FormAddUser userInfo={userInfo} />
      </div>
    </Modal>
  );
};

export default AddStudentModal;
