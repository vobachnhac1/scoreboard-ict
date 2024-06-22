import { Button } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const TableDisplay = ({
  tableData,
  dragItem,
  draggedOverItem,
  handleSort,
  isDragging,
  enableEdit,
  handleDelete,
  setIsDragging
}) => {
  const { t } = useTranslation();
  return (
    <div className="form-table w-full h-full border-gray-300">
      {tableData.map((item, index) => (
        <div
          className={`w-full flex h-10 justify-center items-center cursor-grab`}
          key={`${item.key}_${index}`}
          draggable={!!item?.label}
          onDragStart={() => {
            dragItem.current = index;
            setIsDragging(true);
          }}
          onDragEnter={() => (draggedOverItem.current = index)}
          onDragEnd={handleSort}
          onDragOver={(e) => {
            e.preventDefault();
          }}
        >
          <div className="h-full w-2/3 flex justify-center items-center border">
            <div className="w-1/6 h-full flex items-center justify-center">{item?.label && index + 1}</div>
            <div
              className={`w-4/6 border-x h-full font-normal flex items-center px-8 ${isDragging && dragItem.current === index ? 'bg-gray-400' : 'bg-gray-100 '}`}
            >
              {item.label}
            </div>
            <div className="w-2/6 bg-white disable-select">
              {item.label && (
                <div className="flex w-full justify-center items-center">
                  <Button type="primary mr-2 bg-blue-500" onClick={() => enableEdit(item)}>
                    {t('edit')}
                  </Button>
                  <Button type="primary" danger onClick={() => handleDelete(item.key)}>
                    {t('delete')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableDisplay;
