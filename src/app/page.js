import Header from "../components/OnboardingHeader";
import Footer from "../components/OnboardingFooter";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.canvas}>
      <Header />
      <div className={styles.spacer} />
      <Footer />
    </div>
  );
}
