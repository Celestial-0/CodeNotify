import { ForgotPasswordUI } from "@/components/core/auth";

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordUI
      image={{
        src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
        alt: "Reset your CodeNotify password",
      }}
      quote={{
        text: "We'll help you get back on track. Reset your password and continue receiving contest notifications.",
        author: "CodeNotify Team",
      }}
    />
  );
}
