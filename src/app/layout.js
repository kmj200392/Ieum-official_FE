import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "고려대학교 정보대학 학생회",
  description:
    "고려대학교 정보대학 학생회 공식 웹사이트입니다. 학생회 소개, 동아리 정보, 공지사항, 건의함, 학생회실 대관, 사물함 신청 등 다양한 서비스를 제공합니다.",
  keywords:
    "고려대학교, 정보대학, 학생회, 동아리, 공지사항, 건의함, 대관, 사물함",
  authors: [{ name: "고려대학교 정보대학 학생회" }],
  creator: "고려대학교 정보대학 학생회",
  publisher: "고려대학교 정보대학 학생회",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ieum.korea.ac.kr"),
  openGraph: {
    title: "고려대학교 정보대학 학생회",
    description: "고려대학교 정보대학 학생회 공식 웹사이트",
    url: "https://ieum.korea.ac.kr",
    siteName: "고려대학교 정보대학 학생회",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "고려대학교 정보대학 학생회",
    description: "고려대학교 정보대학 학생회 공식 웹사이트",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
          type="text/css"
        />
        <link
          rel="preload"
          as="font"
          href="/font/Pak_Yong_jun.ttf"
          type="font/ttf"
        />
      </head>
      <body className={inter.variable}>
        <div className="appRoot">{children}</div>
        <div id="portal-root"></div>
      </body>
    </html>
  );
}
