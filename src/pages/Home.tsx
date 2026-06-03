import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import ContentCountdown from "../components/home/countdown/ContentCountdown";
import Hero from "../components/home/hero/Hero";
import ContentMessage from "../components/home/message/ContentMessage";
import ContentOurStory from "../components/home/ourStory/ContentOurStory";

export default function Home() {
   return (
      <>
      <main>
         <Header />

         <Hero />

         <ContentCountdown />

         <ContentOurStory />

         <ContentMessage />

         <Footer />
      </main>
      </>
   );
}