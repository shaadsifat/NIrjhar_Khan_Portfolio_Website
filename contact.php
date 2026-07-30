<?php
/**
 * Contact form handler for the "Let's press something bold" form.
 *
 * Upload this file next to index.html on your host (e.g. cPanel). The form
 * already posts to "contact.php" via fetch() in js/script.js — no other
 * wiring needed once the placeholders below are filled in.
 */

// ============================================================
// CONFIG — replace these before going live
// ============================================================
$recipientEmail = "hello@nirjharkhan.com";   // TODO: the inbox that should receive messages
$siteName       = "Nirjhar Khan Portfolio";  // TODO: shown in the email subject line

// Optional — only needed if you switch from PHP's built-in mail() below to
// SMTP (common on cPanel when mail() ends up in spam folders). Get these
// values from your host's "Email Accounts" / "MX" settings once you've
// created a mailbox, then see the PHPMailer block near the bottom of this
// file for how to use them.
$smtpHost     = "mail.yourdomain.com";  // TODO: your cPanel mail server
$smtpPort     = 587;                    // TODO: 587 (STARTTLS) or 465 (SSL) — check your host
$smtpUsername = "hello@yourdomain.com"; // TODO: full mailbox address
$smtpPassword = "REPLACE_ME";           // TODO: mailbox password — keep this out of version control
// ============================================================

header('Content-Type: application/json');

if($_SERVER['REQUEST_METHOD'] !== 'POST'){
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Honeypot: a hidden field real visitors never fill in. If it has a value,
// silently pretend success so bots move on without knowing they were caught.
if(!empty($_POST['company'])){
    echo json_encode(['ok' => true]);
    exit;
}

function field($key){
    return isset($_POST[$key]) ? trim(strip_tags($_POST[$key])) : '';
}

$name    = field('name');
$email   = field('email');
$subject = field('subject');
$message = field('message');

if($name === '' || $email === '' || $subject === '' || $message === ''){
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please fill in every field.']);
    exit;
}

if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Please enter a valid email address.']);
    exit;
}

$mailSubject = "[$siteName] $subject";
$mailBody = "New message from the contact form:\n\n"
          . "Name: $name\n"
          . "Email: $email\n\n"
          . "Message:\n$message\n";

$hostForFrom = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
$headers = "From: $siteName <no-reply@$hostForFrom>\r\n"
         . "Reply-To: $name <$email>\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

// ------------------------------------------------------------
// Default: PHP's built-in mail(). Works out of the box on most
// cPanel shared hosting with zero extra configuration.
// ------------------------------------------------------------
$sent = @mail($recipientEmail, $mailSubject, $mailBody, $headers);

// ------------------------------------------------------------
// OPTIONAL — SMTP via PHPMailer, if mail() isn't delivering reliably.
// 1. composer require phpmailer/phpmailer   (or upload the library manually)
// 2. Delete/comment out the mail() line above.
// 3. Uncomment the block below and fill in the SMTP settings at the top.
// ------------------------------------------------------------
/*
require __DIR__ . '/vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host       = $smtpHost;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtpUsername;
    $mail->Password   = $smtpPassword;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $smtpPort;

    $mail->setFrom($smtpUsername, $siteName);
    $mail->addAddress($recipientEmail);
    $mail->addReplyTo($email, $name);

    $mail->Subject = $mailSubject;
    $mail->Body    = $mailBody;

    $sent = $mail->send();
} catch (Exception $e) {
    $sent = false;
}
*/

if($sent){
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => "Something went wrong sending your message — please email me directly at $recipientEmail instead."]);
}
