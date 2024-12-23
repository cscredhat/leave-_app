import React from "react";
import { Modal, Radio, Input, Space, Form, Typography, Button } from "antd";
import type { Database } from "@/types/supabase";
import { motion, AnimatePresence } from "framer-motion";

type LeaveType = Database["public"]["Enums"]["leave_type"];

interface ApprovalModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onApprove?: (comment: string, status: "approved" | "rejected") => void;
  leaveRequest?: {
    employeeName: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  };
}

const ApprovalModal = ({
  open = true,
  onOpenChange = () => {},
  onApprove = () => {},
  leaveRequest = {
    employeeName: "张三",
    leaveType: "annual",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    reason: "家庭度假",
  },
}: ApprovalModalProps) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onApprove(values.comment, values.status);
      onOpenChange(false);
      form.resetFields();
    });
  };

  const getLeaveTypeText = (type: LeaveType) => {
    const typeMap = {
      annual: "年假",
      sick: "病假",
      personal: "事假",
      other: "其他",
    };
    return typeMap[type];
  };

  const modalFooter = [
    <Button key="cancel" onClick={() => onOpenChange(false)}>
      取消
    </Button>,
    <Button
      key="submit"
      type="primary"
      onClick={handleSubmit}
      className="gradient-bg hover:opacity-90"
    >
      提交
    </Button>,
  ];

  return (
    <Modal
      title="请假申请审批"
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={modalFooter}
      className="tech-modal"
      width={600}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                status: "approved",
                comment: "",
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 mb-6">
                <motion.div
                  className="modal-info-item"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="modal-info-label">员工</div>
                  <div className="modal-info-value">
                    {leaveRequest.employeeName}
                  </div>
                </motion.div>

                <motion.div
                  className="modal-info-item"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="modal-info-label">请假类型</div>
                  <div className="modal-info-value">
                    {getLeaveTypeText(leaveRequest.leaveType)}
                  </div>
                </motion.div>

                <motion.div
                  className="modal-info-item"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="modal-info-label">时间段</div>
                  <div className="modal-info-value">
                    {leaveRequest.startDate} 至 {leaveRequest.endDate}
                  </div>
                </motion.div>

                <motion.div
                  className="modal-info-item"
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="modal-info-label">请假原因</div>
                  <div className="modal-info-value">{leaveRequest.reason}</div>
                </motion.div>
              </div>

              <Form.Item
                name="status"
                label="审批结果"
                rules={[{ required: true, message: "请选择审批结果" }]}
              >
                <Radio.Group className="approval-radio-group w-full">
                  <div className="flex gap-4">
                    <Radio value="approved" className="flex-1 text-center">
                      通过
                    </Radio>
                    <Radio value="rejected" className="flex-1 text-center">
                      拒绝
                    </Radio>
                  </div>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="comment"
                label="审批意见"
                rules={[{ required: true, message: "请输入审批意见" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入审批意见"
                  className="modal-textarea"
                />
              </Form.Item>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default ApprovalModal;
