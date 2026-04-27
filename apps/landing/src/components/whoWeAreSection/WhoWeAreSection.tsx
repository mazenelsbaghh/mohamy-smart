import './WhoWeAreSection.css';
import HeadTitle from '../headTitle/HeadTitle';
import Container from '../ui/Container';

import Image from 'next/image';
import charm_scales from '../../../public/images/charm_scales.png';
import image1 from '../../../public/images/Image1.png';
import image2 from '../../../public/images/Image2.png';
import image3 from '../../../public/images/Image3.png';


const WhoWeAreSection = () => {
    return (
        <section id='who-we-are-section' className='who-we-are-section py-40'>
            <Container>
                <HeadTitle
                    title='ما هو '
                    span='محامي سمارت؟'
                    desc='محامي سمارت هو أداة قانونية مدعومة بالذكاء الاصطناعي، صُمّمت خصيصًا لمساعدة المحامين في تحليل المستندات واستخلاص النقاط القانونية الهامة بسرعة ودقة.'
                    position='start'
                />
                <div className="flex flex-wrap justify-between mt-32">
                    <div className="w-full mb-5">
                        <div className='box box_1 flex flex-wrap justify-between flex-col-reverse md:flex-row'>
                            <div className="text w-full md:w-7/12">
                                <div className="icon">
                                    <Image src={charm_scales} alt='رمز ميزان العدالة' />
                                </div>
                                <h3>تحليل قانوني دقيق وسريع</h3>
                                <ul>
                                    <li>واجهة سهلة الاستخدام بالعربية</li>
                                    <li>تقارير تحليلية متقدمة</li>
                                </ul>
                            </div>
                            <div className="image w-full md:w-5/12 flex justify-center mb-5 md:mb-0">
                                <Image src={image1} alt='تحليل المستندات القانونية بواسطة الذكاء الاصطناعي' />
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-6/12 md:ps-4 mb-5">
                        <div className="box box_2">
                            <div className="image">
                                <Image src={image2} alt='حماية وموثوقية بيانات الموكلين والمحامين' />
                            </div>
                            <div className="text">
                                <h3>حماية وموثوقية</h3>
                                <ul>
                                    <li>حماية بيانات موكّليك بأعلى المعايير</li>
                                    <li>تكامل مع أنظمة المحاكم الإلكترونية</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-6/12 md:pe-4 mb-5">
                        <div className='box box_3'>
                            <div className="image">
                                <Image src={image3} alt='تحديثات مستمرة بالقوانين والتشريعات المصرية' />
                            </div>
                            <div className="text">
                                <h3>دعم وتحديثات مستمرة</h3>
                                <ul>
                                    <li>تحديثات بأحدث القوانين المصرية</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default WhoWeAreSection;