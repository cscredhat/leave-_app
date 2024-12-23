import React from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Upload,
  Typography,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { supabase } from "@/lib/supabase";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Database } from "@/types/supabase";
import { motion } from "framer-motion";

type LeaveType = Database["public"]["Enums"]["leave_type"];

interface LeaveApplicationFormProps {
  onSubmit?: (data: LeaveFormData) => void;
  isLoading?: boolean;
}

interface LeaveFormData {
  leaveType: LeaveType;
  dateRange: [Date, Date];
  reason: string;
  attachments: File[];
}

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const LeaveApplicationForm = ({
  onSubmit = () => {},
  isLoading: propIsLoading = false,
}: LeaveApplicationFormProps) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      const startDate = values.dateRange[0].toISOString().split("T")[0];
      const endDate = values.dateRange[1].toISOString().split("T")[0];

      const { error } = await supabase.from("leave_requests").insert({
        employee_name: "张三",
        leave_type: values.leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: values.reason,
        status: "pending",
        attachments: values.attachments?.fileList
          ? values.attachments.fileList.map((file: any) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            }))
          : [],
      });

      if (error) throw error;

      message.success("请假申请提交成功");
      form.resetFields();
      onSubmit(values);
    } catch (error) {
      console.error("Error submitting leave request:", error);
      message.error("提交失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="tech-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            leaveType: "annual",
          }}
          className="space-y-6"
        >
          <Form.Item
            name="leaveType"
            label="请假类型"
            rules={[{ required: true, message: "请选择请假类型" }]}
          >
            <Select>
              <Select.Option value="annual">年假</Select.Option>
              <Select.Option value="sick">病假</Select.Option>
              <Select.Option value="personal">事假</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="日期范围"
            rules={[{ required: true, message: "请选择日期范围" }]}
          >
            <RangePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="请假原因"
            rules={[{ required: true, message: "请输入请假原因" }]}
          >
            <TextArea rows={4} placeholder="请详细说明您的请假原因" />
          </Form.Item>

          <Form.Item
            name="attachments"
            label="附件"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e?.fileList;
            }}
          >
            <Upload
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              beforeUpload={() => false}
            >
              <Button type="primary" icon={<UploadOutlined />}>
                选择文件
              </Button>
            </Upload>
          </Form.Item>
          <Typography.Text type="secondary" className="block mb-6">
            支持的文件格式：PDF, DOC, DOCX, JPG, JPEG, PNG
          </Typography.Text>

          <Form.Item className="text-right mb-0">
            <Button
              type="default"
              className="mr-4"
              onClick={() => form.resetFields()}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading || propIsLoading}
            >
              {isLoading || propIsLoading ? "提交中..." : "提交申请"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
};

export default LeaveApplicationForm;
