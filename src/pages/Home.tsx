import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import Hero from "../components/home/hero/Hero";
import ContentMessage from "../components/home/message/ContentMessage";
import OurStory from "../components/ourStory/ContentOurStory";

export default function Home() {
   return (
      <>
      <main>
         <Header />

         <Hero />

         <OurStory />

         <ContentMessage />

         <Footer />
      </main>
      </>
   );
}