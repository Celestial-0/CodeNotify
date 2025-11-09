import { AuthUI } from "@/components/core/auth";

export default function SignUpPage() {
  return (
    <AuthUI
      signInContent={{
        image: {
          src: "https://i.ibb.co/XrkdGrrv/original-ccdd6d6195fff2386a31b684b7abdd2e-removebg-preview.png",
          alt: "Welcome back to CodeNotify",
        },
        quote: {
          text: "Stay notified about coding contests from your favorite platforms.",
          author: "CodeNotify Team",
        },
      }}
      signUpContent={{
        image: {
          src: "https://i.ibb.co/HTZ6DPsS/original-33b8479c324a5448d6145b3cad7c51e7-removebg-preview.png",
          alt: "Join CodeNotify today",
        },
        quote: {
          text: "Never miss a contest again. Get instant notifications.",
          author: "CodeNotify Team",
        },
      }}
    />
  );
}
