import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Hero from "../components/home/hero/Hero";
import ContentMessage from "../components/home/message/ContentMessage";
import ContentOurStory from "../components/home/ourStory/ContentOurStory";

export default function Home() {
   return (
      <>
      <main>
         <Header />

         <Hero />

         <ContentOurStory />

         <ContentMessage />

         <Footer />
      </main>
      </>
   );
}