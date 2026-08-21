import { ArrowRight, Clock3, Goal, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { calcMonthlySavings } from '@/utils/simulation'

const formatCurrency = (value: string | number) => {
  const amount = typeof value === 'string' ? Number(value) : value

  return `R$ ${amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function SimulationItem({
  simulation,
  onDelete,
}: {
  simulation: SimulationRecord
  onDelete: (id: string) => void
}) {
  const navigate = useNavigate()
  const monthlySavings = calcMonthlySavings(simulation)

  return (
    <article className="bg-card flex flex-col gap-5 rounded-2xl p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Goal size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">
              {simulation.goalName}
            </h2>
            <p className="text-muted-foreground flex items-center gap-1 text-sm">
              <Clock3 size={14} />
              Prazo de {simulation.goalDeadline} meses
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Excluir simulação de ${simulation.goalName}`}
          className="text-muted-foreground hover:text-destructive shrink-0 cursor-pointer rounded-lg p-2 transition-colors"
          onClick={() => onDelete(simulation.id)}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-muted-foreground text-xs">Custo da meta</p>
          <p className="font-semibold">R$ {simulation.goalAmount}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">Economia mensal</p>
          <p className="font-semibold">{formatCurrency(monthlySavings)}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-muted-foreground text-xs">Renda mensal</p>
          <p className="font-semibold">R$ {simulation.income}</p>
        </div>
      </div>

      <button
        type="button"
        className="text-primary flex cursor-pointer items-center justify-end gap-2 text-sm font-semibold hover:opacity-80"
        onClick={() => void navigate(`/resultado/${simulation.id}`)}
      >
        Ver resultado
        <ArrowRight size={17} />
      </button>
    </article>
  )
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { deleteSimulation, getAllSimulations } = useSimulationStorage()
  const [simulations, setSimulations] = useState<SimulationRecord[]>(() =>
    getAllSimulations().reverse(),
  )

  const handleDelete = (id: string) => {
    const simulation = simulations.find((item) => item.id === id)

    if (
      !simulation ||
      !window.confirm(`Excluir a simulação "${simulation.goalName}"?`)
    ) {
      return
    }

    deleteSimulation(id)
    setSimulations((current) => current.filter((item) => item.id !== id))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-primary mb-2 text-xs font-bold tracking-[0.2em] uppercase">
            Planejamento
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Histórico de simulações
          </h1>
          <p className="text-muted-foreground mt-2">
            Retome seus planos e acompanhe cada objetivo financeiro.
          </p>
        </div>
        <button
          type="button"
          className="bg-primary text-primary-foreground flex w-fit cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
          onClick={() => void navigate('/')}
        >
          <Wallet size={18} />
          Nova simulação
        </button>
      </div>

      {simulations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {simulations.map((simulation) => (
            <SimulationItem
              key={simulation.id}
              simulation={simulation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card flex min-h-64 flex-col items-center justify-center rounded-2xl p-8 text-center shadow-[4px_4px_18px_0px_rgba(0,0,0,0.12)]">
          <div className="bg-primary/10 text-primary mb-4 flex h-14 w-14 items-center justify-center rounded-full">
            <Clock3 size={26} />
          </div>
          <h2 className="text-xl font-bold">Seu histórico está vazio</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Crie sua primeira simulação para acompanhar seu planejamento por
            aqui.
          </p>
        </div>
      )}
    </main>
  )
}
