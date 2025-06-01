        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <Button 
            variant="outline" 
            onClick={toggleSimulator}
            className={`${isSimulatorActive ? 'bg-green-500/20 border-green-500/50' : ''} glass`}
          >
            {isSimulatorActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isSimulatorActive ? 'Stop Simulator' : 'Start Simulator'}
          </Button>
          
          <Button variant="outline" className="glass">
            <Activity className="w-4 h-4 mr-2" />
            View Live Streams
          </Button>
          
          <Button variant="outline" className="glass">
            <Database className="w-4 h-4 mr-2" />
            CID Browser
          </Button>
          
          <Button variant="outline" className="glass">
            <Shield className="w-4 h-4 mr-2" />
            Consensus Logs
          </Button>

          <Button variant="outline" className="glass">
            <Zap className="w-4 h-4 mr-2" />
            Blockchain Monitor
          </Button>

          <Button variant="outline" className="glass">
            <Users className="w-4 h-4 mr-2" />
            Agent Runtime
          </Button>
        </div> 