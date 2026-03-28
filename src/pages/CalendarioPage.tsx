import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarioPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterTurma, setFilterTurma] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, filterTurma]);

  const fetchEvents = async () => {
    const start = startOfMonth(currentMonth).toISOString();
    const end = endOfMonth(currentMonth).toISOString();
    let query = supabase
      .from('posts')
      .select('id, title, event_date, turma_target')
      .eq('status', 'approved')
      .eq('type', 'evento')
      .gte('event_date', start)
      .lte('event_date', end)
      .order('event_date');

    if (filterTurma !== 'all') {
      query = query.or(`turma_target.eq.${filterTurma},turma_target.is.null`);
    }

    const { data } = await query;
    setEvents(data || []);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfWeek = startOfMonth(currentMonth).getDay();

  const getEventsForDay = (day: Date) =>
    events.filter(e => e.event_date && isSameDay(new Date(e.event_date), day));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-heading font-bold">Calendário</h1>
        <Select value={filterTurma} onValueChange={setFilterTurma}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas turmas</SelectItem>
            <SelectItem value="1">1º Ano</SelectItem>
            <SelectItem value="2">2º Ano</SelectItem>
            <SelectItem value="3">3º Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-heading font-semibold capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden mb-8">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card p-2 min-h-[80px]" />
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className={`bg-card p-2 min-h-[80px] ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
              <span className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map(e => (
                  <Link key={e.id} to={`/post/${e.id}`}>
                    <div className="text-xs bg-secondary/10 text-secondary rounded px-1 py-0.5 truncate hover:bg-secondary/20 transition-colors cursor-pointer">
                      {e.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming list */}
      <h2 className="text-lg font-heading font-semibold mb-3">Eventos deste mês</h2>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum evento neste mês.</p>
      ) : (
        <div className="space-y-2">
          {events.map(e => (
            <Link key={e.id} to={`/post/${e.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-secondary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(e.event_date), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  {e.turma_target && <Badge variant="outline" className="ml-auto">{e.turma_target}º Ano</Badge>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
