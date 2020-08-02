import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { isToday, format, isAfter, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiPower, FiClock } from 'react-icons/fi';

import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointment,
  Section,
  Appointment,
  Calendar,
} from './styles';

import LogoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/Auth';
import api from '../../services/api';

interface MonthAvalilabilityItem {
  day: number;
  available: boolean;
}

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const { signOut, user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailabitity, setMonthAvailabitity] = useState<
    MonthAvalilabilityItem[]
  >([]);
  const [appontments, setAppontments] = useState<Appointment[]>([]);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  useEffect(() => {
    api
      .get(`/providers/${user.id}/month-availabillity`, {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        },
      })
      .then(response => {
        setMonthAvailabitity(response.data);
      });
  }, [currentMonth, user.id]);

  useEffect(() => {
    api
      .get<Appointment[]>('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        const appointmentsFormatted = response.data.map(appontment => {
          return {
            ...appontment,
            hourFormatted: format(parseISO(appontment.date), 'HH:mm'),
          };
        });
        setAppontments(appointmentsFormatted);
      });
  }, [selectedDate]);

  const disableDays = useMemo(() => {
    const dates = monthAvailabitity
      .filter(monthDay => monthDay.available === false)
      .map(monthDay => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });

    return dates;
  }, [currentMonth, monthAvailabitity]);

  const selectDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", { locale: ptBR });
  }, [selectedDate]);

  const selectWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', { locale: ptBR });
  }, [selectedDate]);

  const morningAppointments = useMemo(() => {
    return appontments.filter(appontment => {
      return parseISO(appontment.date).getHours() < 12;
    });
  }, [appontments]);

  const afftrernoomAppointments = useMemo(() => {
    return appontments.filter(appontment => {
      return parseISO(appontment.date).getHours() >= 12;
    });
  }, [appontments]);

  const nextAppointment = useMemo(() => {
    return appontments.find(appontment => {
      isAfter(parseISO(appontment.date), new Date());
    });
  }, [appontments]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={LogoImg} alt={user.name} />
          <Profile>
            <img src={user.avatar_url} alt="Avatar" />
            <div>
              <span>Bem Vindo</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
            </div>
          </Profile>
          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>

      <Content>
        <Schedule>
          <h1>Horários agendados</h1>

          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectDateAsText}</span>
            <span>{selectWeekDay}</span>
          </p>

          {isToday(selectedDate) && nextAppointment && (
            <NextAppointment>
              <strong>Agendamento a seguir</strong>
              <div>
                <img
                  src={nextAppointment.user.avatar_url}
                  alt={nextAppointment.user.name}
                />
                <strong>{nextAppointment.user.name}</strong>
                <span>
                  <FiClock />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </NextAppointment>
          )}

          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {morningAppointments.map(appontment => (
              <Appointment key={appontment.id}>
                <span>
                  <FiClock />
                  {appontment.hourFormatted}
                </span>
                <div>
                  <img
                    src={appontment.user.avatar_url}
                    alt={appontment.user.name}
                  />
                  <strong>{appontment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>

          <Section>
            <strong>Tarde</strong>
            {afftrernoomAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {afftrernoomAppointments.map(appontment => (
              <Appointment key={appontment.id}>
                <span>
                  <FiClock />
                  {appontment.hourFormatted}
                </span>
                <div>
                  <img
                    src={appontment.user.avatar_url}
                    alt={appontment.user.name}
                  />
                  <strong>{appontment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>
        </Schedule>

        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disableDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
