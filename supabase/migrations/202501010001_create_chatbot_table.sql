-- Create the chatbot_questions_answers table to store predefined Q&A pairs
CREATE TABLE chatbot_questions_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_en TEXT NOT NULL,
    question_hi TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_hi TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0, -- Used for ordering questions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the chatbot_greetings table to store greeting options
CREATE TABLE chatbot_greetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    greeting_type VARCHAR(20) NOT NULL, -- 'hello', 'good_afternoon', 'good_evening'
    text_en TEXT NOT NULL,
    text_hi TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default greeting options
INSERT INTO chatbot_greetings (greeting_type, text_en, text_hi, is_active) VALUES
('hello', 'Hello', 'नमस्ते', true),
('good_afternoon', 'Good Afternoon', 'शुभ अपराह्न', true),
('good_evening', 'Good Evening', 'शुभ संध्या', true);

-- Insert sample chatbot questions and answers
INSERT INTO chatbot_questions_answers (question_en, question_hi, answer_en, answer_hi, category, priority, is_active) VALUES
('How can I browse cars?', 'मैं कारें कैसे ब्राउज़ कर सकता हूँ?', 'You can browse cars by visiting the "Showrooms" section and selecting a showroom to view their available cars.', 'आप कारों को ब्राउज़ करने के लिए "शोरूम" अनुभाग पर जा सकते हैं और उनकी उपलब्ध कारों को देखने के लिए एक शोरूम का चयन कर सकते हैं।', 'browsing', 1, true),
('How do I register?', 'मैं पंजीकरण कैसे कर सकता हूँ?', 'Click on the "Get Started" button on the homepage or "Sign In" to create a new account.', 'होमपेज पर "शुरू करें" बटन पर क्लिक करें या नया खाता बनाने के लिए "साइन इन" करें।', 'registration', 2, true),
('How do I book a car?', 'मैं कार कैसे बुक कर सकता हूँ?', 'Select a car you like, click on the "Book Now" button, and fill in the booking details.', 'एक कार का चयन करें जो आपको पसंद है, "अभी बुक करें" बटन पर क्लिक करें, और बुकिंग विवरण भरें।', 'booking', 3, true),
('What payment methods are accepted?', 'कौन से भुगतान विधियाँ स्वीकार की जाती हैं?', 'We accept credit cards, debit cards, and bank transfers for payments.', 'हम भुगतान के लिए क्रेडिट कार्ड, डेबिट कार्ड और बैंक ट्रांसफर स्वीकार करते हैं।', 'payments', 4, true),
('How do I contact support?', 'मैं सहायता से संपर्क कैसे कर सकता हूँ?', 'You can contact support through the "Contact" page or reach out to us directly through the chat feature.', 'आप "संपर्क" पृष्ठ के माध्यम से सहायता से संपर्क कर सकते हैं या चैट सुविधा के माध्यम से हमसे सीधे संपर्क कर सकते हैं।', 'support', 5, true),
('Can I see car specifications?', 'क्या मैं कार की विशिष्टताएँ देख सकता हूँ?', 'Yes, you can view detailed specifications for each car on its individual listing page.', 'हां, आप प्रत्येक कार की विस्तृत विशिष्टताओं को उसके व्यक्तिगत पृष्ठ पर देख सकते हैं।', 'cars', 6, true),
('How do I reset my password?', 'मैं अपना पासवर्ड कैसे रीसेट कर सकता हूँ?', 'Go to the login page and click on "Forgot Password" to reset your password via email.', 'लॉगिन पृष्ठ पर जाएं और ईमेल के माध्यम से पासवर्ड रीसेट करने के लिए "पासवर्ड भूल गए" पर क्लिक करें।', 'account', 7, true),
('What is the refund policy?', 'धनवापसी नीति क्या है?', 'Our refund policy depends on the booking terms. Please check the booking details or contact support for more information.', 'हमारी धनवापसी नीति बुकिंग शर्तों पर निर्भर करती है। कृपया बुकिंग विवरण देखें या अधिक जानकारी के लिए सहायता से संपर्क करें।', 'payments', 8, true),
('Are there any hidden charges?', 'क्या कोई छिपे हुए शुल्क हैं?', 'No, all charges including taxes are clearly displayed during the booking process.', 'नहीं, बुकिंग प्रक्रिया के दौरान सभी शुल्क जैसे कर स्पष्ट रूप से प्रदर्शित किए जाते हैं।', 'payments', 9, true),
('How can I verify a seller?', 'मैं किसी विक्रेता की पुष्टि कैसे कर सकता हूँ?', 'All sellers on our platform are verified. You can check their ratings and reviews from other customers.', 'हमारे प्लेटफॉर्म पर सभी विक्रेता सत्यापित हैं। आप उनकी रेटिंग और अन्य ग्राहकों से समीक्षाएँ देख सकते हैं।', 'verification', 10, true),
('What if I need to cancel my booking?', 'यदि मुझे अपनी बुकिंग रद्द करने की आवश्यकता हो तो क्या होगा?', 'You can cancel your booking through the dashboard. Cancellation fees may apply depending on the terms.', 'आप डैशबोर्ड के माध्यम से अपनी बुकिंग रद्द कर सकते हैं। शर्तों के आधार पर रद्दीकरण शुल्क लागू हो सकता है।', 'booking', 11, true),
('How do I track my car delivery?', 'मैं अपनी कार की डिलीवरी कैसे ट्रैक कर सकता हूँ?', 'You can track your car delivery status in the "My Bookings" section of your dashboard.', 'आप अपने डैशबोर्ड के "मेरी बुकिंग" अनुभाग में अपनी कार की डिलीवरी स्थिति ट्रैक कर सकते हैं।', 'delivery', 12, true),
('Is car insurance included?', 'क्या कार बीमा शामिल है?', 'Insurance details are specified in each car listing. You may need to purchase additional coverage.', 'प्रत्येक कार सूची में बीमा विवरण निर्दिष्ट हैं। आपको अतिरिक्त कवरेज खरीदने की आवश्यकता हो सकती है।', 'insurance', 13, true),
('Can I negotiate the car price?', 'क्या मैं कार की कीमत पर बातचीत कर सकता हूँ?', 'Price negotiation is possible directly with the seller. You can contact them through the chat feature.', 'कीमत वार्ता सीधे विक्रेता के साथ संभव है। आप चैट सुविधा के माध्यम से उनसे संपर्क कर सकते हैं।', 'pricing', 14, true),
('What documents do I need to buy a car?', 'कार खरीदने के लिए मुझे कौन से दस्तावेज़ों की आवश्यकता होगी?', 'You will typically need your ID, proof of address, and insurance documents. Additional requirements may vary by region.', 'आपको आमतौर पर अपनी ID, पता प्रमाण और बीमा दस्तावेज़ों की आवश्यकता होगी। क्षेत्र के आधार पर अतिरिक्त आवश्यकताएँ भिन्न हो सकती हैं।', 'documentation', 15, true),
('How do I add a car to favorites?', 'मैं पसंदीदा में कार कैसे जोड़ूं?', 'Click on the heart icon on any car listing to add it to your favorites for easy access later.', 'बाद की आसान पहुंच के लिए किसी भी कार सूची पर हार्ट आइकन पर क्लिक करें ताकि आप उसे अपनी पसंदीदा में जोड़ सकें।', 'favorites', 16, true);

-- Enable Row Level Security on the new tables
ALTER TABLE chatbot_questions_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_greetings ENABLE ROW LEVEL SECURITY;

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the function to the new tables
CREATE TRIGGER update_chatbot_questions_answers_updated_at 
    BEFORE UPDATE ON chatbot_questions_answers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_greetings_updated_at 
    BEFORE UPDATE ON chatbot_greetings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for chatbot_questions_answers table
-- Allow everyone to read questions and answers (since it's for the chatbot)
CREATE POLICY "Allow read access to chatbot Q&A" ON chatbot_questions_answers FOR SELECT USING (is_active = true);
-- Allow service role to manage chatbot content (for updates via admin panel)
CREATE POLICY "Service role can manage chatbot Q&A" ON chatbot_questions_answers FOR ALL TO service_role USING (true);
-- Allow superadmin to manage chatbot content
CREATE POLICY "Superadmin can manage chatbot Q&A" ON chatbot_questions_answers FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);

-- RLS Policies for chatbot_greetings table
-- Allow everyone to read greetings (since it's for the chatbot)
CREATE POLICY "Allow read access to chatbot greetings" ON chatbot_greetings FOR SELECT USING (is_active = true);
-- Allow service role to manage chatbot greetings
CREATE POLICY "Service role can manage chatbot greetings" ON chatbot_greetings FOR ALL TO service_role USING (true);
-- Allow superadmin to manage chatbot greetings
CREATE POLICY "Superadmin can manage chatbot greetings" ON chatbot_greetings FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'superadmin'
    )
);