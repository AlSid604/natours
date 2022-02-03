import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  //1) Get checkout session from API
  const stripe = Stripe(
    'pk_test_51KOtg9EOcCLFhIo7Kv4G887g2FQCboRTGAyHPKmMHQizV2yhQaZep46oDrUtuSmEnbYXP2yfZdMw3u9jqlKWKsB2006JyDEZwE'
  );
  try {
    const session = await axios(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);
    //2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
};
