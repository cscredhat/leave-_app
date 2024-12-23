import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { motion } from "framer-motion";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar = ({
  activeItem = "leave-application",
  onItemClick = () => {},
}: SidebarProps) => {
  const items: MenuProps["items"] = [
    {
      key: "leave-application",
      icon: <HomeOutlined />,
      label: "请假申请",
    },
    {
      key: "my-applications",
      icon: <FileTextOutlined />,
      label: "我的申请",
    },
    {
      key: "pending-approvals",
      icon: <ClockCircleOutlined />,
      label: "待审批",
    },
    {
      key: "approved",
      icon: <CheckCircleOutlined />,
      label: "已审批",
    },
  ];

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-full glass-effect"
    >
      <div className="p-6 mb-4">
        <h1 className="text-xl font-bold text-gray-800">请假管理系统</h1>
        <p className="text-sm text-gray-500 mt-1">Leave Management System</p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeItem]}
        items={items}
        onClick={({ key }) => onItemClick(key)}
        className="border-r-0"
      />
    </motion.div>
  );
};

export default Sidebar;
