import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { ShieldCheck, Target, Users, Globe } from 'lucide-react'

export default function AboutUsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navigation />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-24 bg-card border-b border-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5">
                        <Globe className="absolute -right-24 -top-24 h-[600px] w-[600px] text-primary" />
                    </div>
                    <div className="mx-auto max-w-screen-2xl px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">About Medixra</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Revolutionizing the medical equipment ecosystem in Pakistan through transparency, technology, and trust.
                        </p>
                    </div>
                </section>

                {/* Our Mission */}
                <section className="py-24">
                    <div className="mx-auto max-w-screen-2xl px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                                    Medixra was founded with a single goal: to make healthcare technology accessible to every corner of Pakistan. We believe that modern medical equipment shouldn't be limited to major cities.
                                </p>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    By building a digital bridge between manufacturers, vendors, and healthcare providers, we are creating a more efficient, reliable, and affordable healthcare infrastructure.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Target, label: 'Precision', val: '100%' },
                                    { icon: Users, label: 'Vendors', val: '500+' },
                                    { icon: ShieldCheck, label: 'Verified', val: '24/7' },
                                    { icon: Globe, label: 'Cities', val: '50+' }
                                ].map((stat, i) => (stat &&
                                    <div key={i} className="p-6 bg-card rounded-2xl border border-border text-center hover:border-primary transition-colors">
                                        <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                                        <div className="text-2xl font-bold text-foreground">{stat.val}</div>
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-24 bg-muted/30">
                    <div className="mx-auto max-w-screen-2xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
                            <p className="text-muted-foreground">The principles that guide everything we do.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Integrity First',
                                    description: 'We maintain the highest standards of honesty and transparency in all our interactions.'
                                },
                                {
                                    title: 'Innovation Driven',
                                    description: 'We leverage technology to solve complex problems in the healthcare supply chain.'
                                },
                                {
                                    title: 'Customer Centric',
                                    description: 'Your success is our success. We are dedicated to providing exceptional support.'
                                }
                            ].map((value, i) => (
                                <div key={i} className="p-8 bg-card rounded-3xl border border-border shadow-sm group hover:shadow-md transition-all">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <span className="text-xl font-bold">{i + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-4">{value.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Join Us Section */}
                <section className="py-24">
                    <div className="mx-auto max-w-screen-2xl px-4 text-center">
                        <div className="bg-primary/5 rounded-[40px] p-12 md:p-20 border border-primary/20">
                            <h2 className="text-4xl font-extrabold text-foreground mb-6">Join Our Growing Network</h2>
                            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                                Whether you're a healthcare provider or a medical equipment vendor, there's a place for you at Medixra.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-all">
                                    Get Started
                                </button>
                                <button className="px-8 py-4 bg-card text-foreground border border-border rounded-full font-bold hover:bg-muted transition-all">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
