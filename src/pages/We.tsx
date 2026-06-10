import ContentOurStory from "../components/album/ourStory/ContentOurStory";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import ContentPhotos from "../components/album/photo/ContentPhotos";


export default function We() {
   return (
      <>
         <main>
            <Header />

            <ContentOurStory />

            <ContentPhotos />

            <Footer />
         </main>
      </>
   );
}