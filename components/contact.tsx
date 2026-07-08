import { useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const purposeOptions = [
  { value: 'hiring', label: 'Hiring Opportunity' },
  { value: 'freelance', label: 'Freelance Project' },
  { value: 'collaboration', label: 'Project Collaboration' },
  { value: 'consultation', label: 'Technical Consultation' },
  { value: 'other', label: 'Other' },
] as const;

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must not exceed 50 characters." })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces." }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .max(100, { message: "Email must not exceed 100 characters." }),
  purpose: z
    .enum(['hiring', 'freelance', 'collaboration', 'consultation', 'other'] as const, {
      required_error: "Please select a purpose for your message.",
    }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters." })
    .max(1000, { message: "Message must not exceed 1000 characters." })
    .trim(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      purpose: undefined,
      message: "",
    },
  });

  const onSubmit = useCallback(async (data: FormValues) => {
    try {
      setIsSubmitting(true);

      // Sanitize and validate data before sending
      const sanitizedData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        purpose: data.purpose,
        message: data.message.trim()
      };

      // Get purpose label from the selected value
      const selectedPurpose = purposeOptions.find(option => option.value === data.purpose);
      const purposeLabel = selectedPurpose ? selectedPurpose.label : 'Not specified';

      // Create FormData and append access key
      const formData = new FormData();
      formData.append('name', sanitizedData.name);
      formData.append('email', sanitizedData.email);
      formData.append('purpose', purposeLabel); // Send the label instead of value
      formData.append('message', sanitizedData.message);
      formData.append('access_key', process.env.NEXT_PUBLIC_WEB3FORMS_KEY || ''); // Use environment variable
      formData.append('from_name', 'Portfolio Contact Form');
      formData.append('subject', `New ${purposeLabel} inquiry from ${sanitizedData.name}`);

      // Add spam protection
      formData.append('botcheck', '');

      // Send the form data to Web3Forms API with proper headers
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Check if the form submission was successful
      if (responseData.success) {
        // Save message to Firestore database
        try {
          const { db } = await import('@/lib/firebase');
          const { collection, addDoc } = await import('firebase/firestore');
          await addDoc(collection(db, 'messages'), {
            name: sanitizedData.name,
            email: sanitizedData.email,
            purpose: purposeLabel,
            message: sanitizedData.message,
            timestamp: new Date().toISOString()
          });
        } catch (dbErr) {
          console.error("Failed to save contact message to Firestore:", dbErr);
        }

        toast({
          title: "Message sent successfully!",
          description: "Thank you for your message. I'll get back to you soon.",
          variant: "default",
        });
        form.reset(); // Only reset on success
      } else {
        throw new Error(responseData.message || 'Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, form]);

  return (
    <section id="contact" ref={containerRef} className="w-full min-h-[calc(100vh-5rem)] flex items-center justify-center pt-2 pb-6 px-4 bg-dot-pattern relative overflow-hidden">
      <div className="absolute inset-0 bg-background/80 dark:bg-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-background/90 dark:bg-black/90 backdrop-blur-md pointer-events-none" />
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8 max-w-xl mx-auto lg:mx-0"
          >
            <div className="space-y-5">
              <h2 className="text-4xl md:text-5xl xl:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 leading-[1.15] pb-1 mb-[3px]">
                Let's Work Together
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                Turn your ideas into reality
              </p>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Have a project in mind or want to collaborate? I'm always excited to hear about new ideas and opportunities. Let's create something amazing together.
            </p>
            <div className="hidden lg:flex flex-col gap-6 pt-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-3.5 rounded-xl">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Quick Response</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">I'll get back to you within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-3.5 rounded-xl">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">Professional Service</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Delivering expert solutions tailored to your needs</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="bg-background/95 dark:bg-card/60 backdrop-blur-sm border border-border/40 rounded-xl p-6 sm:p-8 shadow-lg relative overflow-hidden w-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent"></div>
            <div className="relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          className="bg-background/95 dark:bg-background/20 h-11 rounded-md border-border/50 px-4 w-full" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your email address" 
                          type="email" 
                          className="bg-background/95 dark:bg-background/20 h-11 rounded-md border-border/50 px-4 w-full"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/95 dark:bg-background/20 h-11 rounded-md border-border/50 pl-3 pr-2">
                          <SelectValue placeholder="Select the purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purposeOptions.map((option) => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell me about your project or opportunity..." 
                        className="min-h-[150px] resize-none bg-background/95 dark:bg-background/20 rounded-md border-border/50 px-4 py-3 w-full" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className={cn(
                  "w-full text-base h-12 bg-primary font-medium tracking-wide",
                  isSubmitting && "opacity-80"
                )}
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending message...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </Form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
