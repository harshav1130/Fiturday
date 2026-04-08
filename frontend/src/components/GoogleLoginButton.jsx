import { useEffect } from 'react';

const GoogleLoginButton = ({ onSuccess, onError }) => {
    useEffect(() => {
        // Load the Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: '921319760777-dummy-placeholder-add-your-id.apps.googleusercontent.com', // Replace with real ID
                    callback: handleCredentialResponse
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('google-signIn-btn'),
                    { theme: 'filled_black', size: 'large', text: 'continue_with', shape: 'rectangular', context: 'signin' }
                );
            }
        };

        return () => { document.body.removeChild(script); };
    }, []);

    const handleCredentialResponse = (response) => {
        if (response.credential) {
            onSuccess(response.credential);
        } else {
            onError('Google Sign-In Failed');
        }
    };

    return <div id="google-signIn-btn" className="flex justify-center w-full my-4"></div>;
};

export default GoogleLoginButton;
