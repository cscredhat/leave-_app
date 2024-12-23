import React from "react";
import {
  Table,
  Badge,
  Button,
  Dropdown,
  Modal,
  Space,
  Typography,
  message,
  Card,
} from "antd";
import { supabase } from "@/lib/supabase";
import {
  FilterOutlined,
  SortAscendingOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { Database } from "@/types/supabase";
import { motion } from "framer-motion";

type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];

interface ApplicationListProps {
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  filter?: "my" | "pending" | "approved" | "all";
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  onApprove = () => {},
  onReject = () => {},
  filter = "all",
}) => {
  const [applications, setApplications] = React.useState<LeaveRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedApplication, setSelectedApplication] =
    React.useState<LeaveRequest | null>(null);

  React.useEffect(() => {
    const fetchApplications = async () => {
      try {
        let query = supabase
          .from("leave_requests")
          .select("*")
          .order("created_at", { ascending: false });

        switch (filter) {
          case "my":
            query = query.eq("employee_name", "张三");
            break;
          case "pending":
            query = query.eq("status", "pending");
            break;
          case "approved":
            query = query.or("status.eq.approved,status.eq.rejected");
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        message.error("获取请假申请列表失败");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    const channel = supabase
      .channel("leave_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leave_requests" },
        (payload) => {
          fetchApplications();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const statusConfig = {
      pending: { status: "warning" as const, text: "待审批" },
      approved: { status: "success" as const, text: "已通过" },
      rejected: { status: "error" as const, text: "已拒绝" },
    };

    const config = statusConfig[status || "pending"];
    return <Badge status={config.status} text={config.text} />;
  };

  const handleMenuClick = (application: LeaveRequest, key: string) => {
    if (key === "view") {
      setSelectedApplication(application);
    } else if (key === "approve") {
      onApprove(application.id);
    } else if (key === "reject") {
      onReject(application.id);
    }
  };

  const getLeaveTypeText = (type: LeaveRequest["leave_type"]) => {
    const typeMap = {
      annual: "年假",
      sick: "病假",
      personal: "事假",
      other: "其他",
    };
    return typeMap[type];
  };

  const columns = [
    {
      title: "员工",
      dataIndex: "employee_name",
      key: "employee_name",
    },
    {
      title: "请假类型",
      dataIndex: "leave_type",
      key: "leave_type",
      render: (type: LeaveRequest["leave_type"]) => getLeaveTypeText(type),
    },
    {
      title: "开始日期",
      dataIndex: "start_date",
      key: "start_date",
    },
    {
      title: "结束日期",
      dataIndex: "end_date",
      key: "end_date",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: LeaveRequest["status"]) => getStatusBadge(status),
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: LeaveRequest) => {
        const items: MenuProps["items"] = [
          { key: "view", label: "查看详情" },
          ...(record.status === "pending" && filter === "pending"
            ? [
                { key: "approve", label: "通过" },
                { key: "reject", label: "拒绝" },
              ]
            : []),
        ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => handleMenuClick(record, key),
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="tech-card">
        <div className="flex justify-between items-center mb-6">
          <Typography.Title level={4} className="!mb-0">
            请假申请列表
          </Typography.Title>
          <Space>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              className="hover:scale-105 transition-transform"
            >
              筛选
            </Button>
            <Button
              type="primary"
              icon={<SortAscendingOutlined />}
              className="hover:scale-105 transition-transform"
            >
              排序
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          className="tech-table"
        />

        <Modal
          title="请假申请详情"
          open={!!selectedApplication}
          onCancel={() => setSelectedApplication(null)}
          footer={[
            <Button key="close" onClick={() => setSelectedApplication(null)}>
              关闭
            </Button>,
            selectedApplication?.status === "pending" &&
              filter === "pending" && (
                <>
                  <Button
                    key="approve"
                    type="primary"
                    onClick={() => {
                      onApprove(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                  >
                    通过
                  </Button>
                  <Button
                    key="reject"
                    danger
                    onClick={() => {
                      onReject(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                  >
                    拒绝
                  </Button>
                </>
              ),
          ].filter(Boolean)}
          className="tech-modal"
        >
          {selectedApplication && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4"
            >
              <p>
                <strong>员工：</strong> {selectedApplication.employee_name}
              </p>
              <p>
                <strong>请假类型：</strong>{" "}
                {getLeaveTypeText(selectedApplication.leave_type)}
              </p>
              <p>
                <strong>开始日期：</strong> {selectedApplication.start_date}
              </p>
              <p>
                <strong>结束日期：</strong> {selectedApplication.end_date}
              </p>
              <p>
                <strong>状态：</strong>
                {getStatusBadge(selectedApplication.status)}
              </p>
              <p>
                <strong>原因：</strong> {selectedApplication.reason}
              </p>
              {selectedApplication.comment && (
                <p>
                  <strong>审批意见：</strong> {selectedApplication.comment}
                </p>
              )}
            </motion.div>
          )}
        </Modal>
      </Card>
    </motion.div>
  );
};

export default ApplicationList;
