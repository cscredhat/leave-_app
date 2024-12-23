import React from "react";
import Sidebar from "./leave-request/Sidebar";
import LeaveApplicationForm from "./leave-request/LeaveApplicationForm";
import ApplicationList from "./leave-request/ApplicationList";
import ApprovalModal from "./leave-request/ApprovalModal";
import { supabase } from "@/lib/supabase";
import { message } from "antd";
import type { Database } from "@/types/supabase";
import { motion } from "framer-motion";

type LeaveRequest = Database["public"]["Tables"]["leave_requests"]["Row"];

interface HomeProps {
  defaultView?: string;
}

const Home = ({ defaultView = "leave-application" }: HomeProps) => {
  const [activeView, setActiveView] = React.useState(defaultView);
  const [showApprovalModal, setShowApprovalModal] = React.useState(false);
  const [selectedApplication, setSelectedApplication] =
    React.useState<LeaveRequest | null>(null);

  const handleApproval = async (id: string, comment: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "approved",
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      message.success("审批已通过");
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("审批失败，请重试");
    }
  };

  const handleRejection = async (id: string, comment: string) => {
    try {
      const { error } = await supabase
        .from("leave_requests")
        .update({
          status: "rejected",
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      message.success("已拒绝申请");
      setShowApprovalModal(false);
    } catch (error) {
      console.error("Error rejecting request:", error);
      message.error("操作失败，请重试");
    }
  };

  const fetchLeaveRequest = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("leave_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedApplication(data);
        setShowApprovalModal(true);
      }
    } catch (error) {
      console.error("Error fetching leave request:", error);
      message.error("获取申请详情失败");
    }
  };

  const renderContent = () => {
    const content = (() => {
      switch (activeView) {
        case "leave-application":
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                提交请假申请
              </h1>
              <LeaveApplicationForm />
            </div>
          );
        case "my-applications":
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                我的请假申请
              </h1>
              <ApplicationList filter="my" />
            </div>
          );
        case "pending-approvals":
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                待审批申请
              </h1>
              <ApplicationList
                filter="pending"
                onApprove={(id) => fetchLeaveRequest(id)}
                onReject={(id) => fetchLeaveRequest(id)}
              />
            </div>
          );
        case "approved":
          return (
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-6 text-gray-800">
                已审批申请
              </h1>
              <ApplicationList filter="approved" />
            </div>
          );
        default:
          return null;
      }
    })();

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white">
      <Sidebar activeItem={activeView} onItemClick={setActiveView} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
      <ApprovalModal
        open={showApprovalModal}
        onOpenChange={setShowApprovalModal}
        onApprove={(comment, status) => {
          if (!selectedApplication) return;

          if (status === "approved") {
            handleApproval(selectedApplication.id, comment);
          } else {
            handleRejection(selectedApplication.id, comment);
          }
        }}
        leaveRequest={
          selectedApplication
            ? {
                employeeName: selectedApplication.employee_name,
                leaveType: selectedApplication.leave_type,
                startDate: selectedApplication.start_date,
                endDate: selectedApplication.end_date,
                reason: selectedApplication.reason,
              }
            : undefined
        }
      />
    </div>
  );
};

export default Home;
