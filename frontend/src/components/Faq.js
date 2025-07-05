// frontend/src/components/Faq.js
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqData = [
    {
        question: "What is a Tracking Number & Where Can I Find It?",
        answer: "A tracking number or ID is a combination of numbers and possibly letters that uniquely identifies your shipment for national or international tracking. Usually, the shipper or online shop is able to provide the tracking number or ID. If you have ordered a product in an online shop, the confirmation email or shipment tracking notification often contains the tracking number or ID. If not, please contact your shipper or online shop."
    },
    {
        question: "When will my tracking information appear?",
        answer: "Tracking events usually appear 24-48 hours after receiving the Track and Trace ID. In general, once the shipment has reached our facility, a tracking event will appear."
    },
    {
        question: "Why is my tracking number/ID not working?",
        answer: "Please make sure you entered the correct tracking number in the correct format. Check for minimum length of 5 characters, and if there are any special characters in your input. Tab, comma, space and semicolon are understood as separators between several Tracking IDs. If your tracking ID is not working, please contact your shipper or online shop."
    },
    {
        question: "If I do not have my tracking number, is it still possible to track my shipment?",
        answer: "If you do not have a tracking number, we advise you to contact your shipper. However, if you have other shipping reference numbers, they may work using shipment tracking systems of the specific business unit in charge of the shipment (for example: DHL Express or DHL Freight)."
    }
];

const FaqItem = ({ item, isOpen, onClick }) => {
    return (
        <div className="faq-item">
            <div className="faq-question" onClick={onClick}>
                <span>{item.question}</span>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {isOpen && <div className="faq-answer"><p>{item.answer}</p></div>}
        </div>
    );
};

const Faq = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const handleClick = (index) => {
        // Tıklanan soru zaten açıksa kapat, değilse aç
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="faq-container">
            <h2>Frequently Asked Questions</h2>
            {faqData.map((item, index) => (
                <FaqItem
                    key={index}
                    item={item}
                    isOpen={openIndex === index}
                    onClick={() => handleClick(index)}
                />
            ))}
        </div>
    );
};

export default Faq;